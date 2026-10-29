package com.mercatto.modules.pedido.service;

import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.pedido.repository.PagoRepository;
import com.mercatto.modules.pedido.repository.PedidoItemRepository;
import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.soporte.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PagoService {

    @Autowired private PagoRepository pagoRepo;
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private PedidoItemRepository itemRepo;
    @Autowired private StripeService stripeService;
    @Autowired private WompiService wompiService;
    @Autowired private EmailService emailService;
    @Autowired private com.mercatto.modules.producto.repository.ProductoRepository productoRepo;
    @Autowired private com.mercatto.modules.vendedor.repository.VendedorRepository vendedorRepo;

    @Transactional
    public Map<String, Object> iniciarPagoInvitado(Long pedidoId, String metodoStr) {
        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE) {
            throw new BadRequestException("El pedido ya se encuentra en estado: " + pedido.getEstado());
        }

        return iniciarPago(pedidoId, metodoStr, pedido.getComprador());
    }

    @Transactional
    public Map<String, Object> confirmarPagoInvitado(Long pedidoId, String transaccionId) {
        Pedido pedido = pedidoRepo.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        return confirmarPago(pedidoId, transaccionId, pedido.getComprador());
    }

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

        boolean yaEstabaAprobado = (pago.getEstado() == Pago.EstadoPago.APROBADO);

        pago.setEstado(Pago.EstadoPago.APROBADO);
        pago.setTransaccionId(transaccionId != null ? transaccionId : pago.getTransaccionId());
        pago.setFechaPago(LocalDateTime.now());
        pagoRepo.save(pago);

        pedido.setEstado(Pedido.EstadoPedido.PAGADO);
        pedidoRepo.save(pedido);
        actualizarVentasDePedido(pedido);

        // Envío de correo elegante de confirmación y factura solo si no había sido notificado antes
        if (!yaEstabaAprobado) {
            notificarPagoExitoso(pedido, pago);
        }

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
                    boolean yaEstabaAprobado = (pago.getEstado() == Pago.EstadoPago.APROBADO);
                    pago.setEstado(Pago.EstadoPago.APROBADO);
                    pago.setFechaPago(LocalDateTime.now());
                    Pedido pedido = pago.getPedido();
                    pedido.setEstado(Pedido.EstadoPedido.PAGADO);
                    pedidoRepo.save(pedido);
                    actualizarVentasDePedido(pedido);
                    pagoRepo.save(pago);

                    if (!yaEstabaAprobado) {
                        notificarPagoExitoso(pedido, pago);
                    }
                } else if ("DECLINED".equalsIgnoreCase(status) || "VOIDED".equalsIgnoreCase(status) || "ERROR".equalsIgnoreCase(status)) {
                    pago.setEstado(Pago.EstadoPago.RECHAZADO);
                    pagoRepo.save(pago);
                }
                return true;
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(PagoService.class).error("Error procesando webhook Wompi: {}", e.getMessage());
        }
        return false;
    }

    // ── Envío de correos tras la confirmación del pago ─────────────
    private void notificarPagoExitoso(Pedido pedido, Pago pago) {
        try {
            // Asegurar que los ítems estén disponibles
            List<PedidoItem> items = pedido.getItems();
            if (items == null || items.isEmpty()) {
                items = itemRepo.findByPedido(pedido);
                pedido.setItems(items);
            }

            // 1. Enviar recibo de pago y factura elegante al comprador
            emailService.enviarReciboPagoComprador(pedido, pago);

            // 2. Notificar a cada tienda/vendedor involucrado con sus artículos vendidos
            Map<Long, List<PedidoItem>> itemsPorVendedor = new LinkedHashMap<>();
            for (PedidoItem item : items) {
                if (item.getVendedor() != null && item.getVendedor().getId() != null) {
                    itemsPorVendedor
                        .computeIfAbsent(item.getVendedor().getId(), k -> new ArrayList<>())
                        .add(item);
                }
            }

            for (List<PedidoItem> itemsVendedor : itemsPorVendedor.values()) {
                if (!itemsVendedor.isEmpty() && itemsVendedor.get(0).getVendedor() != null) {
                    Vendedor vendedor = itemsVendedor.get(0).getVendedor();
                    emailService.enviarNotificacionVentaPagada(vendedor, pedido, itemsVendedor);
                }
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(PagoService.class)
                    .error("Error al enviar notificaciones de correo tras el pago del pedido #{}: {}", pedido.getCodigo(), e.getMessage());
        }
    }

    public void actualizarVentasDePedido(Pedido pedido) {
        if (pedido == null || pedido.getItems() == null) return;
        for (PedidoItem item : pedido.getItems()) {
            if (item.getProducto() != null) {
                Long pId = item.getProducto().getId();
                Integer ventasPagadas = itemRepo.sumarVentasPagadasPorProducto(pId);
                productoRepo.findById(pId).ifPresent(prod -> {
                    prod.setTotalVentas(ventasPagadas != null ? ventasPagadas : 0);
                    productoRepo.save(prod);
                });
            }
            if (item.getVendedor() != null) {
                Long vId = item.getVendedor().getId();
                Integer vVentas = itemRepo.sumarVentasPagadasPorVendedor(vId);
                vendedorRepo.findById(vId).ifPresent(vend -> {
                    vend.setTotalVentas(vVentas != null ? vVentas : 0);
                    vendedorRepo.save(vend);
                });
            }
        }
    }
}