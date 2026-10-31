package com.mercatto.modules.pedido.service;

import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.pedido.repository.CuponRepository;
import com.mercatto.modules.pedido.repository.PagoRepository;
import com.mercatto.modules.pedido.repository.PedidoItemRepository;
import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.ProductoVariante;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.producto.repository.VarianteRepository;
import com.mercatto.modules.soporte.service.EmailService;
import com.mercatto.modules.usuario.model.Direccion;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.usuario.repository.DireccionRepository;
import com.mercatto.modules.vendedor.model.Vendedor;

import com.mercatto.dto.request.PedidoRequest;
import com.mercatto.dto.response.PedidoResponse;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private PedidoItemRepository itemRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private VarianteRepository varianteRepo;
    @Autowired private DireccionRepository direccionRepo;
    @Autowired private CuponRepository cuponRepo;
    @Autowired private PagoRepository pagoRepo;
    @Autowired private EmailService emailService;
    @Autowired private com.mercatto.modules.usuario.repository.UsuarioRepository usuarioRepo;
    @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Autowired private com.mercatto.modules.vendedor.service.VendedorService vendedorService;
    @Autowired private com.mercatto.modules.vendedor.repository.VendedorRepository vendedorRepo;

    @Transactional
    public PedidoResponse crearPedidoInvitado(PedidoRequest req) {
        if (req.getEmailInvitado() == null || req.getEmailInvitado().trim().isEmpty()) {
            throw new BadRequestException("El correo electrÃ³nico es obligatorio para compras como invitado.");
        }

        String email = req.getEmailInvitado().trim().toLowerCase();
        // ValidaciÃ³n estricta de formato email
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BadRequestException("El formato del correo electrÃ³nico es invÃ¡lido.");
        }

        String nombre = req.getNombreInvitado() != null && !req.getNombreInvitado().trim().isEmpty()
                ? req.getNombreInvitado().trim()
                : (req.getNuevaDireccion() != null && req.getNuevaDireccion().getNombreCompleto() != null
                    ? req.getNuevaDireccion().getNombreCompleto().trim()
                    : "Comprador Invitado");

        String telefono = req.getTelefonoInvitado() != null && !req.getTelefonoInvitado().trim().isEmpty()
                ? req.getTelefonoInvitado().trim()
                : (req.getNuevaDireccion() != null ? req.getNuevaDireccion().getTelefono() : null);

        // Si el usuario ya existe con ese email, asociamos el pedido a su cuenta existente
        Usuario comprador = usuarioRepo.findByEmail(email).orElseGet(() -> {
            Usuario nuevo = new Usuario();
            nuevo.setEmail(email);
            nuevo.setNombre(nombre);
            nuevo.setTelefono(telefono);
            nuevo.setRol(Usuario.Rol.COMPRADOR);
            nuevo.setActivo(true);
            nuevo.setEmailVerificado(false);
            nuevo.setFechaRegistro(LocalDateTime.now());
            // Generar password seguro encriptado
            nuevo.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            return usuarioRepo.save(nuevo);
        });

        if (telefono != null && !telefono.isBlank() && (comprador.getTelefono() == null || comprador.getTelefono().isBlank())) {
            comprador.setTelefono(telefono);
            comprador = usuarioRepo.save(comprador);
        }

        // Asegurar que la direcciÃ³n tenga el nombre y telÃ©fono si vinieron vacÃ­os
        if (req.getNuevaDireccion() != null) {
            if (req.getNuevaDireccion().getNombreCompleto() == null || req.getNuevaDireccion().getNombreCompleto().isEmpty()) {
                req.getNuevaDireccion().setNombreCompleto(nombre);
            }
            if (req.getNuevaDireccion().getTelefono() == null || req.getNuevaDireccion().getTelefono().isEmpty()) {
                req.getNuevaDireccion().setTelefono(telefono);
            }
        }

        return crearPedido(req, comprador);
    }

    @Transactional
    public PedidoResponse crearPedido(PedidoRequest req, Usuario comprador) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestException("El pedido debe tener al menos un producto");
        }

        // 1. Obtener o crear direcciÃ³n
        Direccion direccion = null;
        if (req.getDireccionId() != null) {
            direccion = direccionRepo.findById(req.getDireccionId())
                    .orElseThrow(() -> new ResourceNotFoundException("DirecciÃ³n de envÃ­o no encontrada"));
        } else if (req.getNuevaDireccion() != null) {
            PedidoRequest.DireccionDTO d = req.getNuevaDireccion();
            direccion = new Direccion();
            direccion.setUsuario(comprador);
            String nomDir = (d.getNombreCompleto() != null && !d.getNombreCompleto().isBlank())
                    ? d.getNombreCompleto().trim()
                    : (comprador.getNombre() != null ? comprador.getNombre() : "Destinatario");
            String telDir = (d.getTelefono() != null && !d.getTelefono().isBlank())
                    ? d.getTelefono().trim()
                    : (comprador.getTelefono() != null ? comprador.getTelefono() : "");
            direccion.setNombreCompleto(nomDir);
            direccion.setTelefono(telDir);
            direccion.setDireccion(d.getDireccion() != null && !d.getDireccion().isBlank() ? d.getDireccion().trim() : "Cartagena de Indias");
            direccion.setBarrio(d.getBarrio() != null ? d.getBarrio().trim() : "");
            direccion.setCiudad(d.getCiudad() != null && !d.getCiudad().isBlank() ? d.getCiudad().trim() : "Cartagena de Indias");
            direccion.setDepartamento(d.getDepartamento() != null && !d.getDepartamento().isBlank() ? d.getDepartamento().trim() : "Bolívar");
            direccion.setCodigoPostal(d.getCodigoPostal());
            String notasDir = (d.getNotasEntrega() != null && !d.getNotasEntrega().isBlank())
                    ? d.getNotasEntrega().trim()
                    : (req.getNotas() != null && !req.getNotas().isBlank() ? req.getNotas().trim() : null);
            direccion.setNotasEntrega(notasDir);
            direccion = direccionRepo.save(direccion);

            if (!telDir.isBlank() && (comprador.getTelefono() == null || comprador.getTelefono().isBlank())) {
                comprador.setTelefono(telDir);
                usuarioRepo.save(comprador);
            }
        }

        // 2. Procesar Ã­tems y calcular totales
        double subtotal = 0.0;
        List<PedidoItem> items = new ArrayList<>();

        for (PedidoRequest.ItemDTO itemDto : req.getItems()) {
            Producto producto = productoRepo.findById(itemDto.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: ID " + itemDto.getProductoId()));

            if (!producto.isActivo()) {
                throw new BadRequestException("El producto '" + producto.getTitulo() + "' ya no estÃ¡ disponible.");
            }

            double precioUnitario = producto.getPrecioOferta() != null ? producto.getPrecioOferta() : producto.getPrecio();
            String nombreVariante = null;
            String imagenUrl = (producto.getImagenes() != null && !producto.getImagenes().isEmpty())
                    ? producto.getImagenes().get(0).getUrl() : null;

            ProductoVariante variante = null;
            if (itemDto.getVarianteId() != null) {
                variante = varianteRepo.findById(itemDto.getVarianteId())
                        .orElseThrow(() -> new ResourceNotFoundException("Variante no encontrada: ID " + itemDto.getVarianteId()));

                if (variante.getStock() < itemDto.getCantidad()) {
                    throw new BadRequestException("Stock insuficiente para '" + producto.getTitulo() + " (" + variante.getNombre() + ")'");
                }
                precioUnitario = variante.getPrecioOferta() != null ? variante.getPrecioOferta() : variante.getPrecio();
                nombreVariante = variante.getNombre();
                if (variante.getImagenUrl() != null) {
                    imagenUrl = variante.getImagenUrl();
                }
                // Descontar stock de variante
                variante.setStock(variante.getStock() - itemDto.getCantidad());
                varianteRepo.save(variante);
            } else {
                if (producto.getStock() < itemDto.getCantidad()) {
                    throw new BadRequestException("Stock insuficiente para '" + producto.getTitulo() + "'");
                }
                // Descontar stock de producto
                int stockActual = producto.getStock() != null ? producto.getStock() : 0;
                producto.setStock(Math.max(0, stockActual - itemDto.getCantidad()));
            }

            // Ventas solo se contabilizan cuando el pedido pase a PAGADO
            productoRepo.save(producto);

            PedidoItem item = new PedidoItem();
            item.setProducto(producto);
            item.setVariante(variante);
            Vendedor vendedorItem = producto.getVendedor();
            item.setVendedor(vendedorItem);
            item.setNombreProducto(producto.getTitulo());
            item.setNombreVariante(nombreVariante);
            item.setImagenUrl(imagenUrl);
            item.setPrecioUnitario(precioUnitario);
            item.setCantidad(itemDto.getCantidad());
            double itemSubtotal = precioUnitario * itemDto.getCantidad();
            item.setSubtotal(itemSubtotal);

            // Congelar plan y comisiÃ³n al momento de la compra
            Vendedor.TipoSuscripcion planAlMomento = (vendedorItem != null && vendedorItem.getTipoSuscripcion() != null)
                    ? vendedorItem.getTipoSuscripcion()
                    : Vendedor.TipoSuscripcion.STARTER;
            double tasaComision = vendedorService.obtenerTasaComision(planAlMomento);
            double porcentajeComision = Math.round(tasaComision * 100.0 * 10.0) / 10.0;
            double montoComision = Math.round(itemSubtotal * tasaComision * 100.0) / 100.0;
            double netoVendedor = Math.round((itemSubtotal - montoComision) * 100.0) / 100.0;

            item.setPlanVendedor(planAlMomento.name());
            item.setPorcentajeComision(porcentajeComision);
            item.setMontoComision(montoComision);
            item.setNetoVendedor(netoVendedor);

            items.add(item);
            subtotal += itemSubtotal;
        }

        // 3. CupÃ³n de descuento
        double descuento = 0.0;
        Cupon cupon = null;
        if (req.getCuponCodigo() != null && !req.getCuponCodigo().isBlank()) {
            cupon = cuponRepo.findByCodigoIgnoreCaseAndActivoTrue(req.getCuponCodigo()).orElse(null);
            if (cupon != null && cupon.esValidoParaMonto(subtotal)) {
                descuento = cupon.calcularDescuento(subtotal);
                cupon.setUsosActuales(cupon.getUsosActuales() + 1);
                cuponRepo.save(cupon);
            }
        }

        // 4. Costo de envÃ­o (ej: Gratis a partir de 150.000 COP, o tarifa estÃ¡ndar 12.000 COP)
        double costoEnvio = (subtotal >= 150000) ? 0.0 : 12000.0;
        double total = Math.max(0.0, (subtotal - descuento) + costoEnvio);

        // 5. Crear el Pedido
        Pedido pedido = new Pedido();
        pedido.setCodigo(generarCodigoPedido());
        pedido.setComprador(comprador);
        pedido.setDireccion(direccion);
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        pedido.setSubtotal(subtotal);
        pedido.setDescuento(descuento);
        pedido.setCostoEnvio(costoEnvio);
        pedido.setTotal(total);
        pedido.setCupon(cupon);
        String notasFinales = req.getNotas();
        if ((notasFinales == null || notasFinales.isBlank()) && direccion != null && direccion.getNotasEntrega() != null) {
            notasFinales = direccion.getNotasEntrega();
        }
        pedido.setNotas(notasFinales);

        Pedido guardado = pedidoRepo.save(pedido);

        // Asociar y guardar Ã­tems
        for (PedidoItem item : items) {
            item.setPedido(guardado);
        }
        itemRepo.saveAll(items);
        guardado.setItems(items);

        // Crear registro de pago
        Pago pago = new Pago();
        pago.setPedido(guardado);
        try {
            pago.setMetodo(Pago.MetodoPago.valueOf(req.getMetodoPago().toUpperCase()));
        } catch (Exception e) {
            pago.setMetodo(Pago.MetodoPago.WOMPI);
        }
        pago.setEstado(Pago.EstadoPago.PENDIENTE);
        pago.setMonto(total);
        pagoRepo.save(pago);
        guardado.setPago(pago);

        // Si es pago Contra Entrega, notificar de inmediato con recibo completo. Para pagos en lÃ­nea (Wompi, Stripe, etc.), el recibo se envÃ­a tras confirmar el pago en PagoService
        if (pago.getMetodo() == Pago.MetodoPago.CONTRA_ENTREGA) {
            emailService.enviarReciboPagoComprador(guardado, pago);
            notificarVendedoresPedido(guardado, items);
        }

        return convertirAResponse(guardado);
    }

    private void notificarVendedoresPedido(Pedido pedido, List<PedidoItem> items) {
        Map<Long, List<PedidoItem>> itemsPorVendedor = new LinkedHashMap<>();
        for (PedidoItem item : items) {
            if (item.getVendedor() != null && item.getVendedor().getId() != null) {
                itemsPorVendedor
                    .computeIfAbsent(item.getVendedor().getId(), k -> new ArrayList<>())
                    .add(item);
            }
        }
        for (List<PedidoItem> itemsVendedor : itemsPorVendedor.values()) {
            Vendedor vendedor = itemsVendedor.get(0).getVendedor();
            emailService.enviarNotificacionVentaPagada(vendedor, pedido, itemsVendedor);
        }
    }

    // â”€â”€ Notificaciones por correo (comprador + cada vendedor) â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private void notificarPedidoPorCorreo(Pedido pedido, Usuario comprador, List<PedidoItem> items,
                                           double subtotal, double descuento, double costoEnvio, double total) {
        // Correo al comprador con el detalle completo
        String filasComprador = items.stream().map(this::filaHtml).collect(Collectors.joining());
        if (comprador.getEmail() != null) {
            emailService.enviarConfirmacionPedidoComprador(
                    comprador.getEmail(), comprador.getNombre(), pedido.getCodigo(),
                    filasComprador, subtotal, descuento, costoEnvio, total);
        }

        // Un correo por cada vendedor involucrado, solo con sus propios Ã­tems
        Map<Long, List<PedidoItem>> itemsPorVendedor = new LinkedHashMap<>();
        for (PedidoItem item : items) {
            itemsPorVendedor
                .computeIfAbsent(item.getVendedor().getId(), k -> new ArrayList<>())
                .add(item);
        }

        for (List<PedidoItem> itemsVendedor : itemsPorVendedor.values()) {
            Vendedor vendedor = itemsVendedor.get(0).getVendedor();
            String emailVendedor = vendedor.getUsuario() != null ? vendedor.getUsuario().getEmail() : null;
            if (emailVendedor == null) continue;

            String filasVendedor = itemsVendedor.stream().map(this::filaHtml).collect(Collectors.joining());
            double totalVendedor = itemsVendedor.stream().mapToDouble(PedidoItem::getSubtotal).sum();

            emailService.enviarNotificacionNuevaVenta(
                    emailVendedor, vendedor.getNombreTienda(), pedido.getCodigo(),
                    filasVendedor, totalVendedor);
        }
    }

    private String filaHtml(PedidoItem item) {
        String nombre = item.getNombreProducto()
                + (item.getNombreVariante() != null ? " (" + item.getNombreVariante() + ")" : "");
        return String.format(
            "<tr><td style=\"padding:8px;border-top:1px solid #e2e8f0\">%s</td>" +
            "<td style=\"padding:8px;border-top:1px solid #e2e8f0\">%d</td>" +
            "<td style=\"padding:8px;border-top:1px solid #e2e8f0\">$%,.0f</td></tr>",
            nombre, item.getCantidad(), item.getSubtotal());
    }

    public Page<PedidoResponse> listarPorComprador(Usuario comprador, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano);
        return pedidoRepo.findByCompradorOrderByFechaCreacionDesc(comprador, pageable).map(this::convertirAResponse);
    }

    public Page<PedidoResponse> listarPorVendedor(Vendedor vendedor, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano);
        return pedidoRepo.findByVendedor(vendedor, pageable).map(this::convertirAResponse);
    }

    public Page<PedidoResponse> listarTodos(int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano);
        return pedidoRepo.findAllByOrderByFechaCreacionDesc(pageable).map(this::convertirAResponse);
    }

    public PedidoResponse obtenerPorId(Long id, Usuario usuario) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        boolean esComprador = pedido.getComprador().getId().equals(usuario.getId());
        boolean esAdmin = usuario.getRol() == Usuario.Rol.ADMIN;
        boolean esVendedorDelPedido = pedido.getItems().stream()
                .anyMatch(i -> i.getVendedor().getUsuario().getId().equals(usuario.getId()));

        if (!esComprador && !esAdmin && !esVendedorDelPedido) {
            throw new UnauthorizedException("No tienes permiso para ver este pedido.");
        }

        return convertirAResponse(pedido);
    }

    public PedidoResponse rastrearPedido(String codigo, String email) {
        if (codigo == null || codigo.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Debes proporcionar el cÃ³digo de pedido y el correo electrÃ³nico.");
        }
        Pedido pedido = pedidoRepo.findByCodigo(codigo.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontrÃ³ ningÃºn pedido con el cÃ³digo: " + codigo));

        if (pedido.getComprador() == null || pedido.getComprador().getEmail() == null ||
            !pedido.getComprador().getEmail().equalsIgnoreCase(email.trim())) {
            throw new BadRequestException("El correo electrÃ³nico proporcionado no coincide con el registrado en este pedido.");
        }

        return convertirAResponse(pedido);
    }

    @Transactional
    public PedidoResponse actualizarEstado(Long id, String nuevoEstadoStr, String guia, String empresa) {
        return actualizarEstado(id, nuevoEstadoStr, guia, empresa, null);
    }

    @Transactional
    public PedidoResponse actualizarEstado(Long id, String nuevoEstadoStr, String guia, String empresa, String evidencia) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        Pedido.EstadoPedido nuevoEstado = Pedido.EstadoPedido.valueOf(nuevoEstadoStr.toUpperCase());

        if (nuevoEstado == Pedido.EstadoPedido.ENTREGADO) {
            String evidenciaFinal = (evidencia != null && !evidencia.trim().isEmpty())
                    ? evidencia.trim()
                    : pedido.getEvidenciaEntregaUrl();
            if (evidenciaFinal == null || evidenciaFinal.isEmpty()) {
                throw new BadRequestException("Debes subir una imagen como evidencia de entrega para poder marcar el pedido como ENTREGADO.");
            }
            pedido.setEvidenciaEntregaUrl(evidenciaFinal);
        }

        pedido.setEstado(nuevoEstado);

        if (guia != null) pedido.setGuiaSeguimiento(guia);
        if (empresa != null) pedido.setEmpresaEnvio(empresa);

        if (nuevoEstado == Pedido.EstadoPedido.ENTREGADO) {
            if (pedido.getPago() != null) {
                pedido.getPago().setEstado(Pago.EstadoPago.APROBADO);
                if (pedido.getPago().getFechaPago() == null) {
                    pedido.getPago().setFechaPago(LocalDateTime.now());
                }
                pagoRepo.save(pedido.getPago());
            }
            // Desembolso y liquidaciÃ³n automÃ¡tica de fondos a cada tienda asociada al entregarse el pedido
            if (pedido.getItems() != null) {
                for (PedidoItem item : pedido.getItems()) {
                    if (item.getVendedor() != null) {
                        double tasa = vendedorService.obtenerTasaComision(item.getVendedor().getTipoSuscripcion());
                        double comisionRetenida = Math.round(item.getSubtotal() * tasa * 100.0) / 100.0;
                        double montoNetoTienda = Math.round((item.getSubtotal() - comisionRetenida) * 100.0) / 100.0;
                        org.slf4j.LoggerFactory.getLogger(PedidoService.class).info(
                            "âœ… [DESEMBOLSO AUTOMÃTICO A TIENDA] Pedido {} marcado como ENTREGADO. Transferido automÃ¡ticamente a Tienda '{}' (ID: {}): ${} COP (ComisiÃ³n Mercatto retenida: ${} COP)",
                            pedido.getCodigo(), item.getVendedor().getNombreTienda(), item.getVendedor().getId(), montoNetoTienda, comisionRetenida
                        );
                    }
                }
            }
        } else if (nuevoEstado == Pedido.EstadoPedido.PAGADO && pedido.getPago() != null) {
            pedido.getPago().setEstado(Pago.EstadoPago.APROBADO);
            if (pedido.getPago().getFechaPago() == null) {
                pedido.getPago().setFechaPago(LocalDateTime.now());
            }
            pagoRepo.save(pedido.getPago());
        } else if (nuevoEstado == Pedido.EstadoPedido.CANCELADO) {
            if (pedido.getEstado() != Pedido.EstadoPedido.CANCELADO) {
                revertirStock(pedido);
            }
            if (pedido.getPago() != null) {
                if (pedido.getPago().getEstado() == Pago.EstadoPago.APROBADO) {
                    pedido.getPago().setEstado(Pago.EstadoPago.REEMBOLSADO);
                } else {
                    pedido.getPago().setEstado(Pago.EstadoPago.RECHAZADO);
                }
                pagoRepo.save(pedido.getPago());
            }
        }

                Pedido guardado = pedidoRepo.save(pedido);
        if (nuevoEstado == Pedido.EstadoPedido.PAGADO || nuevoEstado == Pedido.EstadoPedido.CANCELADO) {
            recalcularVentasPedido(guardado);
        }
        return convertirAResponse(guardado);
    }

    @Transactional
    public PedidoResponse cancelarPedido(Long id, Usuario usuario) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        boolean esComprador = pedido.getComprador() != null && pedido.getComprador().getId().equals(usuario.getId());
        boolean esAdmin = usuario.getRol() == Usuario.Rol.ADMIN;
        boolean esVendedorDelPedido = pedido.getItems() != null && pedido.getItems().stream()
                .anyMatch(i -> i.getVendedor() != null && i.getVendedor().getUsuario() != null && i.getVendedor().getUsuario().getId().equals(usuario.getId()));

        if (!esComprador && !esAdmin && !esVendedorDelPedido) {
            throw new UnauthorizedException("No tienes permiso para cancelar este pedido.");
        }

        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            throw new BadRequestException("El pedido ya se encuentra cancelado.");
        }

        if (pedido.getEstado() == Pedido.EstadoPedido.ENTREGADO) {
            throw new BadRequestException("No es posible cancelar un pedido que ya ha sido entregado.");
        }

        if (esComprador && pedido.getEstado() == Pedido.EstadoPedido.ENVIADO) {
            throw new BadRequestException("El pedido ya estÃ¡ en camino. Por favor comunÃ­cate con la tienda o soporte para coordinar la novedad.");
        }

        revertirStock(pedido);

        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        if (pedido.getPago() != null) {
            if (pedido.getPago().getEstado() == Pago.EstadoPago.APROBADO) {
                pedido.getPago().setEstado(Pago.EstadoPago.REEMBOLSADO);
            } else {
                pedido.getPago().setEstado(Pago.EstadoPago.RECHAZADO);
            }
            pagoRepo.save(pedido.getPago());
        }

                Pedido cancelado = pedidoRepo.save(pedido);
        recalcularVentasPedido(cancelado);
        return convertirAResponse(cancelado);
    }

    private void revertirStock(Pedido pedido) {
        if (pedido.getItems() != null) {
            for (PedidoItem item : pedido.getItems()) {
                if (item.getVariante() != null) {
                    ProductoVariante v = item.getVariante();
                    v.setStock(v.getStock() + item.getCantidad());
                    varianteRepo.save(v);
                }
                if (item.getProducto() != null) {
                    Producto prod = item.getProducto();
                    prod.setStock(prod.getStock() + item.getCantidad());
                    productoRepo.save(prod);
                }
            }
        }
    }

    public PedidoResponse convertirAResponse(Pedido p) {
        PedidoResponse res = new PedidoResponse();
        res.setId(p.getId());
        res.setCodigo(p.getCodigo());
        res.setEstado(p.getEstado().name());
        res.setSubtotal(p.getSubtotal());
        res.setDescuento(p.getDescuento());
        res.setCostoEnvio(p.getCostoEnvio());
        res.setTotal(p.getTotal());
        res.setGuiaSeguimiento(p.getGuiaSeguimiento());
        res.setEmpresaEnvio(p.getEmpresaEnvio());
        res.setEvidenciaEntregaUrl(p.getEvidenciaEntregaUrl());
        res.setNotas(p.getNotas());
        res.setFechaCreacion(p.getFechaCreacion());

        if (p.getPago() != null) {
            res.setMetodoPago(p.getPago().getMetodo().name());
            res.setEstadoPago(p.getPago().getEstado().name());
        }

        if (p.getComprador() != null) {
            PedidoResponse.CompradorDTO cDto = new PedidoResponse.CompradorDTO();
            cDto.setId(p.getComprador().getId());
            cDto.setNombre(p.getComprador().getNombre());
            cDto.setEmail(p.getComprador().getEmail());
            res.setComprador(cDto);
        }

        if (p.getDireccion() != null) {
            PedidoResponse.DireccionDTO dDto = new PedidoResponse.DireccionDTO();
            dDto.setNombreCompleto(p.getDireccion().getNombreCompleto());
            dDto.setTelefono(p.getDireccion().getTelefono());
            dDto.setDireccion(p.getDireccion().getDireccion());
            dDto.setBarrio(p.getDireccion().getBarrio());
            dDto.setCiudad(p.getDireccion().getCiudad());
            dDto.setDepartamento(p.getDireccion().getDepartamento());
            dDto.setNotasEntrega(p.getDireccion().getNotasEntrega() != null ? p.getDireccion().getNotasEntrega() : p.getNotas());
            res.setDireccion(dDto);
        }

        if (p.getItems() != null && !p.getItems().isEmpty()) {
            res.setItems(p.getItems().stream().map(i -> {
                PedidoResponse.ItemDTO itemDto = new PedidoResponse.ItemDTO();
                itemDto.setId(i.getId());
                itemDto.setProductoId(i.getProducto().getId());
                itemDto.setNombreProducto(i.getNombreProducto());
                itemDto.setNombreVariante(i.getNombreVariante());
                itemDto.setImagenUrl(i.getImagenUrl());
                itemDto.setPrecioUnitario(i.getPrecioUnitario());
                itemDto.setCantidad(i.getCantidad());
                itemDto.setSubtotal(i.getSubtotal());
                itemDto.setPlanVendedor(i.getPlanVendedor());
                itemDto.setPorcentajeComision(i.getPorcentajeComision());
                itemDto.setMontoComision(i.getMontoComision());
                itemDto.setNetoVendedor(i.getNetoVendedor());
                if (i.getVendedor() != null) {
                    itemDto.setVendedorId(i.getVendedor().getId());
                    itemDto.setNombreTienda(i.getVendedor().getNombreTienda());
                }
                return itemDto;
            }).collect(Collectors.toList()));

            // Asignar tienda principal al pedido para la auditorÃ­a de marketplace
            p.getItems().stream()
                .filter(i -> i.getVendedor() != null && i.getVendedor().getNombreTienda() != null)
                .findFirst()
                .ifPresent(i -> {
                    res.setNombreTienda(i.getVendedor().getNombreTienda());
                    res.setVendedorId(i.getVendedor().getId());
                });

            double sumaComision = p.getItems().stream()
                .filter(i -> i.getMontoComision() != null)
                .mapToDouble(PedidoItem::getMontoComision)
                .sum();
            double sumaNeto = p.getItems().stream()
                .filter(i -> i.getNetoVendedor() != null)
                .mapToDouble(PedidoItem::getNetoVendedor)
                .sum();

            res.setMontoComision(Math.round(sumaComision * 100.0) / 100.0);
            res.setNetoVendedor(Math.round(sumaNeto * 100.0) / 100.0);
        } else {
            res.setMontoComision(0.0);
            res.setNetoVendedor(p.getTotal());
        }

        if (p.getEstado() == Pedido.EstadoPedido.ENTREGADO) {
            res.setEstadoDesembolso("DESEMBOLSADO");
        } else if (p.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            res.setEstadoDesembolso("CANCELADO");
        } else {
            res.setEstadoDesembolso("EN_CUSTODIA");
        }

        return res;
    }

    private String generarCodigoPedido() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + new Random().nextInt(9000);
        return "PED-" + fecha + "-" + rand;
    }

    public void recalcularVentasPedido(Pedido pedido) {
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