package com.mercatto.modules.pedido.service;

import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.pedido.repository.PagoRepository;
import com.mercatto.modules.pedido.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PagoService {

    @Autowired private PagoRepository pagoRepo;
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private StripeService stripeService;
    @Autowired private WompiService wompiService;

    @Transactional
    public Map<String, Object> iniciarPago(Long pedidoId, String metodoStr, Usuario usuario) {
        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (!pedido.getComprador().getId().equals(usuario.getId())) {
            throw new BadRequestException("No puedes pagar un pedido que no te pertenece");
        }

        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE) {
            throw new BadRequestException("El pedido ya se encuentra en estado: " + pedido.getEstado());
        }

        Pago pago = pagoRepo.findByPedido(pedido).orElseGet(() -> {
            Pago p = new Pago();
            p.setPedido(pedido);
            p.setMonto(pedido.getTotal());
            return p;
        });

        Pago.MetodoPago metodo;
        try {
            metodo = Pago.MetodoPago.valueOf(metodoStr.toUpperCase());
        } catch (Exception e) {
            metodo = Pago.MetodoPago.WOMPI;
        }
        pago.setMetodo(metodo);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("pedidoId", pedido.getId());
        respuesta.put("codigoPedido", pedido.getCodigo());
        respuesta.put("monto", pedido.getTotal());
        respuesta.put("metodo", metodo.name());

        String nombreCliente = usuario.getNombre() != null ? usuario.getNombre() : "Cliente Mercatto";
        String telefonoCliente = pedido.getDireccion() != null && pedido.getDireccion().getTelefono() != null
                ? pedido.getDireccion().getTelefono()
                : (usuario.getTelefono() != null ? usuario.getTelefono() : "3000000000");

        if (metodo == Pago.MetodoPago.WOMPI || metodo == Pago.MetodoPago.PSE || metodo == Pago.MetodoPago.NEQUI) {
            Map<String, Object> wompiData = wompiService.prepararCheckout(
                    pedido.getTotal(), pedido.getCodigo(), usuario.getEmail(), nombreCliente, telefonoCliente
            );
            pago.setPasarelaReferencia((String) wompiData.get("reference"));
            respuesta.putAll(wompiData);
        } else if (metodo == Pago.MetodoPago.CONTRA_ENTREGA) {
            String ref = "COD-" + pedido.getCodigo();
            pago.setTransaccionId(ref);
            respuesta.put("referencia", ref);
            respuesta.put("instrucciones", "Pagarás en efectivo al recibir el pedido en tu dirección.");
        } else if (metodo == Pago.MetodoPago.STRIPE || metodo == Pago.MetodoPago.TARJETA_CREDITO) {
            Map<String, Object> intent = stripeService.crearPaymentIntent(
                    pedido.getTotal(), pedido.getCodigo(), usuario.getEmail()
            );
            pago.setTransaccionId((String) intent.get("paymentIntentId"));
            respuesta.putAll(intent);
        }

        pagoRepo.save(pago);
        return respuesta;
    }

    @Transactional
    public Map<String, Object> confirmarPago(Long pedidoId, String transaccionId, Usuario usuario) {
        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        Pago pago = pagoRepo.findByPedido(pedido)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de pago no encontrado"));

        pago.setEstado(Pago.EstadoPago.APROBADO);
        pago.setTransaccionId(transaccionId != null ? transaccionId : pago.getTransaccionId());
        pago.setFechaPago(LocalDateTime.now());
        pagoRepo.save(pago);

        pedido.setEstado(Pedido.EstadoPedido.PAGADO);
        pedidoRepo.save(pedido);

        return Map.of(
                "exito", true,
                "mensaje", "¡Pago confirmado exitosamente! Tu pedido está en preparación.",
                "codigoPedido", pedido.getCodigo(),
                "estado", pedido.getEstado().name()
        );
    }

    @Transactional
    public boolean procesarWebhookWompi(Map<String, Object> evento) {
        try {
            if (!"nequi_transaction_updated".equalsIgnoreCase((String) evento.get("event")) &&
                !"transaction.updated".equalsIgnoreCase((String) evento.get("event"))) {
                return true;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) evento.get("data");
            if (data == null) return false;

            @SuppressWarnings("unchecked")
            Map<String, Object> transaccion = (Map<String, Object>) data.get("transaction");
            if (transaccion == null) return false;

            String status = (String) transaccion.get("status");
            String reference = (String) transaccion.get("reference");
            String transaccionId = (String) transaccion.get("id");

            Pago pago = pagoRepo.findByPasarelaReferencia(reference).orElse(null);
            if (pago == null) {
                // Intento buscar por transaccionId
                pago = pagoRepo.findByTransaccionId(reference).orElse(null);
            }

            if (pago != null) {
                pago.setTransaccionId(transaccionId);
                if ("APPROVED".equalsIgnoreCase(status)) {
                    pago.setEstado(Pago.EstadoPago.APROBADO);
                    pago.setFechaPago(LocalDateTime.now());
                    Pedido pedido = pago.getPedido();
                    pedido.setEstado(Pedido.EstadoPedido.PAGADO);
                    pedidoRepo.save(pedido);
                } else if ("DECLINED".equalsIgnoreCase(status) || "VOIDED".equalsIgnoreCase(status) || "ERROR".equalsIgnoreCase(status)) {
                    pago.setEstado(Pago.EstadoPago.RECHAZADO);
                }
                pagoRepo.save(pago);
                return true;
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(PagoService.class).error("Error procesando webhook Wompi: {}", e.getMessage());
        }
        return false;
    }
}
