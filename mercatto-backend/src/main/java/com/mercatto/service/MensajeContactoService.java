package com.mercatto.service;

import com.mercatto.dto.request.MensajeRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.exception.UnauthorizedException;
import com.mercatto.model.*;
import com.mercatto.repository.MensajeContactoRepository;
import com.mercatto.repository.MensajeRepository;
import com.mercatto.repository.PedidoRepository;
import com.mercatto.repository.ProductoRepository;
import com.mercatto.repository.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MensajeContactoService {

    @Autowired private MensajeContactoRepository mensajeRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private PedidoRepository pedidoRepo;

    @Transactional
    public MensajeContacto enviarMensaje(MensajeRequest req, Usuario emisor) {
        Producto producto = productoRepo.findById(req.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        Vendedor vendedor = producto.getVendedor();
        if (vendedor == null) {
            throw new BadRequestException("El producto no tiene un vendedor asociado");
        }

        MensajeContacto msg = new MensajeContacto();
        msg.setProducto(producto);
        msg.setVendedor(vendedor);
        msg.setAsunto(req.getAsunto() != null ? req.getAsunto() : "Consulta sobre: " + producto.getTitulo());
        msg.setMensaje(req.getMensaje());

        if (req.getPedidoId() != null) {
            Pedido pedido = pedidoRepo.findById(req.getPedidoId()).orElse(null);
            msg.setPedido(pedido);
        }

        // Si el emisor es el vendedor de la tienda:
        if (vendedor.getUsuario().getId().equals(emisor.getId())) {
            msg.setEsDeComprador(false);
            // Si responde, necesitamos saber el comprador. Por defecto, si viene en respuesta se asigna.
            msg.setComprador(emisor); // En respuestas se puede mapear adecuadamente
        } else {
            msg.setEsDeComprador(true);
            msg.setComprador(emisor);
        }

        return mensajeRepo.save(msg);
    }

    public List<MensajeContacto> obtenerConversacion(Usuario usuario, Long productoId) {
        return mensajeRepo.findConversacion(usuario, productoId);
    }

    public Page<MensajeContacto> bandejaVendedor(Vendedor vendedor, int pagina, int tamano) {
        return mensajeRepo.findByVendedorOrderByFechaEnvioDesc(vendedor, PageRequest.of(pagina, tamano));
    }

    public Page<MensajeContacto> bandejaComprador(Usuario comprador, int pagina, int tamano) {
        return mensajeRepo.findByCompradorOrderByFechaEnvioDesc(comprador, PageRequest.of(pagina, tamano));
    }

    @Transactional
    public void marcarLeido(Long mensajeId, Usuario usuario) {
        MensajeContacto msg = mensajeRepo.findById(mensajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));

        boolean esDestinatario = (msg.isEsDeComprador() && msg.getVendedor().getUsuario().getId().equals(usuario.getId()))
                || (!msg.isEsDeComprador() && msg.getComprador().getId().equals(usuario.getId()));

        if (esDestinatario) {
            msg.setLeido(true);
            mensajeRepo.save(msg);
        }
    }

    @Autowired private MensajeRepository mensajeWsRepo;

    public long contarNoLeidos(Usuario usuario) {
        long wsNoLeidos = mensajeWsRepo.countByDestinatarioAndLeidoFalse(usuario);

        Optional<Vendedor> vOpt = vendedorRepo.findByUsuario(usuario);
        long contactoNoLeidos = vOpt.isPresent()
                ? mensajeRepo.countByVendedorAndLeidoFalse(vOpt.get())
                : mensajeRepo.countByCompradorAndLeidoFalse(usuario);

        return wsNoLeidos + contactoNoLeidos;
    }
}
