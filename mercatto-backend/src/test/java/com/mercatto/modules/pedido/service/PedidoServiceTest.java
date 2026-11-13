package com.mercatto.modules.pedido.service;

import com.mercatto.dto.request.PedidoRequest;
import com.mercatto.dto.response.PedidoResponse;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
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
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.modules.vendedor.service.VendedorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PedidoServiceTest {

    @Mock private PedidoRepository pedidoRepo;
    @Mock private PedidoItemRepository itemRepo;
    @Mock private ProductoRepository productoRepo;
    @Mock private VarianteRepository varianteRepo;
    @Mock private DireccionRepository direccionRepo;
    @Mock private CuponRepository cuponRepo;
    @Mock private PagoRepository pagoRepo;
    @Mock private EmailService emailService;
    @Mock private UsuarioRepository usuarioRepo;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private VendedorService vendedorService;
    @Mock private VendedorRepository vendedorRepo;

    @InjectMocks
    private PedidoService pedidoService;

    private Usuario comprador;
    private Vendedor vendedor;
    private Producto producto;
    private ProductoVariante variante;

    @BeforeEach
    void setUp() {
        comprador = new Usuario();
        comprador.setId(1L);
        comprador.setEmail("invitado@mercatto.com");
        comprador.setNombre("Carlos Pérez");
        comprador.setRol(Usuario.Rol.COMPRADOR);

        vendedor = new Vendedor();
        vendedor.setId(10L);
        vendedor.setNombreTienda("TecnoCartagena");
        vendedor.setTipoSuscripcion(Vendedor.TipoSuscripcion.STARTER);

        producto = new Producto();
        producto.setId(100L);
        producto.setTitulo("Auriculares Bluetooth");
        producto.setPrecio(100000.0);
        producto.setStock(20);
        producto.setActivo(true);
        producto.setVendedor(vendedor);

        variante = new ProductoVariante();
        variante.setId(1L);
        variante.setNombre("Negro");
        variante.setPrecio(100000.0);
        variante.setStock(10);
        variante.setProducto(producto);
    }

    @Test
    @DisplayName("TC-01: Compra Exitosa (Happy Path) - Crea pedido con variante en stock y retorna PENDIENTE")
    void tc01_compraExitosaHappyPath() {
        // 1. ARRANGE
        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("invitado@mercatto.com");
        req.setNombreInvitado("Carlos Pérez");
        req.setMetodoPago("WOMPI");

        PedidoRequest.DireccionDTO dirDto = new PedidoRequest.DireccionDTO();
        dirDto.setNombreCompleto("Carlos Pérez");
        dirDto.setTelefono("3001234567");
        dirDto.setDireccion("Bocagrande Cra 3 # 5-20");
        dirDto.setCiudad("Cartagena de Indias");
        req.setNuevaDireccion(dirDto);

        PedidoRequest.ItemDTO itemDto = new PedidoRequest.ItemDTO();
        itemDto.setProductoId(100L);
        itemDto.setVarianteId(1L);
        itemDto.setCantidad(2);
        req.setItems(List.of(itemDto));

        when(usuarioRepo.findByEmail("invitado@mercatto.com")).thenReturn(Optional.of(comprador));
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(i -> (Usuario) i.getArgument(0));
        when(direccionRepo.save(any(Direccion.class))).thenAnswer(i -> {
            Direccion d = i.getArgument(0);
            d.setId(50L);
            return d;
        });
        when(productoRepo.findById(100L)).thenReturn(Optional.of(producto));
        when(varianteRepo.findById(1L)).thenReturn(Optional.of(variante));
        when(vendedorService.obtenerTasaComision(any())).thenReturn(0.06);

        when(pedidoRepo.save(any(Pedido.class))).thenAnswer(i -> {
            Pedido p = i.getArgument(0);
            p.setId(500L);
            return p;
        });

        // 2. ACT
        PedidoResponse res = pedidoService.crearPedidoInvitado(req);

        // 3. ASSERT
        assertNotNull(res);
        assertEquals("PENDIENTE", res.getEstado());
        assertEquals(8, variante.getStock(), "El stock de la variante debe reducirse de 10 a 8");
        verify(pedidoRepo, times(1)).save(any(Pedido.class));
        verify(itemRepo, times(1)).saveAll(any());
        verify(pagoRepo, times(1)).save(any(Pago.class));
    }

    @Test
    @DisplayName("TC-02: Quiebre de Stock (Caso Límite) - Lanza BadRequestException cuando solicitado supera stock")
    void tc02_quiebreDeStockCasoLimite() {
        // 1. ARRANGE
        variante.setStock(2);

        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("cliente@test.com");
        PedidoRequest.ItemDTO itemDto = new PedidoRequest.ItemDTO();
        itemDto.setProductoId(100L);
        itemDto.setVarianteId(1L);
        itemDto.setCantidad(5); // Pide 5 habiendo solo 2
        req.setItems(List.of(itemDto));

        when(usuarioRepo.findByEmail("cliente@test.com")).thenReturn(Optional.of(comprador));
        when(productoRepo.findById(100L)).thenReturn(Optional.of(producto));
        when(varianteRepo.findById(1L)).thenReturn(Optional.of(variante));

        // 2. ACT & 3. ASSERT
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(req);
        });

        assertTrue(ex.getMessage().toLowerCase().contains("stock insuficiente"));
        verify(pedidoRepo, never()).save(any());
        verify(pagoRepo, never()).save(any());
    }

    @Test
    @DisplayName("TC-03: Email Vacío o Espacios - Lanza BadRequestException inmediata sin consultar DB")
    void tc03_emailVacioOEspacios() {
        // 1. ARRANGE
        PedidoRequest reqEspacios = new PedidoRequest();
        reqEspacios.setEmailInvitado("   ");

        PedidoRequest reqNull = new PedidoRequest();
        reqNull.setEmailInvitado(null);

        // 2. ACT & 3. ASSERT
        assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(reqEspacios);
        });

        assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(reqNull);
        });

        verifyNoInteractions(pedidoRepo);
        verifyNoInteractions(emailService);
    }

    @Test
    @DisplayName("TC-04: Cupón Inexistente - Lanza ResourceNotFoundException si se envía cupón no encontrado")
    void tc04_cuponInexistenteLanzaExcepcion() {
        // 1. ARRANGE
        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("comprador@mercatto.com");
        req.setCuponCodigo("NO_EXISTE");

        PedidoRequest.ItemDTO itemDto = new PedidoRequest.ItemDTO();
        itemDto.setProductoId(100L);
        itemDto.setCantidad(1);
        req.setItems(List.of(itemDto));

        when(usuarioRepo.findByEmail("comprador@mercatto.com")).thenReturn(Optional.of(comprador));
        when(productoRepo.findById(100L)).thenReturn(Optional.of(producto));
        when(vendedorService.obtenerTasaComision(any())).thenReturn(0.06);
        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("NO_EXISTE")).thenReturn(Optional.empty());

        // 2. ACT & 3. ASSERT
        assertThrows(ResourceNotFoundException.class, () -> {
            pedidoService.crearPedidoInvitado(req);
        });

        verify(pedidoRepo, never()).save(any());
    }

    @Test
    @DisplayName("TC-05: Cupón con Monto Mínimo No Alcanzado - Lanza BadRequestException")
    void tc05_cuponMontoMinimoNoAlcanzado() {
        // 1. ARRANGE
        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("comprador@mercatto.com");
        req.setCuponCodigo("SUPERDESCUENTO");

        // Subtotal = 100.000 COP
        PedidoRequest.ItemDTO itemDto = new PedidoRequest.ItemDTO();
        itemDto.setProductoId(100L);
        itemDto.setCantidad(1);
        req.setItems(List.of(itemDto));

        Cupon cuponExigente = new Cupon();
        cuponExigente.setCodigo("SUPERDESCUENTO");
        cuponExigente.setMontoMinimo(300000.0); // Exige mínimo 300.000 COP
        cuponExigente.setActivo(true);

        when(usuarioRepo.findByEmail("comprador@mercatto.com")).thenReturn(Optional.of(comprador));
        when(productoRepo.findById(100L)).thenReturn(Optional.of(producto));
        when(vendedorService.obtenerTasaComision(any())).thenReturn(0.06);
        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("SUPERDESCUENTO")).thenReturn(Optional.of(cuponExigente));

        // 2. ACT & 3. ASSERT
        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(req);
        });

        assertTrue(ex.getMessage().contains("monto actual"));
        verify(pedidoRepo, never()).save(any());
    }

    @Test
    @DisplayName("TC-06: Pedido Sin Items - Lanza BadRequestException")
    void tc06_pedidoSinItems() {
        PedidoRequest req = new PedidoRequest();
        req.setEmailInvitado("test@mercatto.com");
        req.setItems(Collections.emptyList());

        when(usuarioRepo.findByEmail("test@mercatto.com")).thenReturn(Optional.of(comprador));

        assertThrows(BadRequestException.class, () -> {
            pedidoService.crearPedidoInvitado(req);
        });
    }

    @Test
    @DisplayName("TC-07: Cálculo de Envío - Gratis para subtotal >= 150.000 COP, 12.000 COP en caso contrario")
    void tc07_calculoEnvioGratisYTarifaEstandar() {
        // Caso A: Subtotal = 200.000 COP (2 unidades de 100.000) -> Envio 0.0
        PedidoRequest reqGratis = new PedidoRequest();
        reqGratis.setEmailInvitado("envio@test.com");
        PedidoRequest.ItemDTO item2 = new PedidoRequest.ItemDTO();
        item2.setProductoId(100L);
        item2.setCantidad(2);
        reqGratis.setItems(List.of(item2));

        when(usuarioRepo.findByEmail("envio@test.com")).thenReturn(Optional.of(comprador));
        when(productoRepo.findById(100L)).thenReturn(Optional.of(producto));
        when(vendedorService.obtenerTasaComision(any())).thenReturn(0.06);
        when(pedidoRepo.save(any(Pedido.class))).thenAnswer(i -> (Pedido) i.getArgument(0));

        PedidoResponse resGratis = pedidoService.crearPedidoInvitado(reqGratis);
        assertEquals(0.0, resGratis.getCostoEnvio());
        assertEquals(200000.0, resGratis.getTotal());

        // Caso B: Subtotal = 100.000 COP (1 unidad) -> Envio 12.000
        PedidoRequest reqPago = new PedidoRequest();
        reqPago.setEmailInvitado("envio@test.com");
        PedidoRequest.ItemDTO item1 = new PedidoRequest.ItemDTO();
        item1.setProductoId(100L);
        item1.setCantidad(1);
        reqPago.setItems(List.of(item1));

        PedidoResponse resPago = pedidoService.crearPedidoInvitado(reqPago);
        assertEquals(12000.0, resPago.getCostoEnvio());
        assertEquals(112000.0, resPago.getTotal());
    }
}
