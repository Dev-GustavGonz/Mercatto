// Feature Modules - Mercatto Domain Re-export Index
// Centraliza el acceso organizado por entidades en el frontend

// 1. Entidad: Auth & Cuenta
export * as AuthService from '../../services/authService'
export { default as LoginPage } from '../../pages/Login'
export { default as RegistroPage } from '../../pages/Registro'

// 2. Entidad: Productos & Catálogo
export * as ProductoService from '../../services/productoService'
export { default as CatalogoPage } from '../../pages/Catalogo'
export { default as DetalleProductoPage } from '../../pages/DetalleProducto'
export { default as CategoriaPage } from '../../pages/Categoria'
export { default as BusquedaPage } from '../../pages/Busqueda'
export { default as FavoritosPage } from '../../pages/Favoritos'

// 3. Entidad: Pedidos, Carrito & Pagos
export * as PedidoService from '../../services/pedidoService'
export * as PagoService from '../../services/pagoService'
export { default as CarritoPage } from '../../pages/Carrito'
export { default as CheckoutPage } from '../../pages/Checkout'
export { default as MisPedidosPage } from '../../pages/MisPedidos'
export { default as PagoExitosoPage } from '../../pages/PagoExitoso'
export { default as PagoCanceladoPage } from '../../pages/PagoCancelado'

// 4. Entidad: Tiendas & Vendedores
export * as VendedorService from '../../services/vendedorService'
export * as TiendaService from '../../services/tiendaService'
export { default as DirectorioTiendasPage } from '../../pages/DirectorioTiendas'
export { default as VitrinaTiendaPage } from '../../pages/VitrinaTienda'
export { default as PanelVendedorPage } from '../../pages/PanelVendedor'

// 5. Entidad: Perfil de Usuario & Direcciones
export * as UsuarioService from '../../services/usuarioService'
export * as DireccionService from '../../services/direccionService'
export { default as PerfilPage } from '../../pages/Perfil'

// 6. Entidad: Mensajería & Comunicación
export * as MensajeService from '../../services/mensajeService'
export * as WebsocketService from '../../services/websocketService'
export { default as MensajesPage } from '../../pages/Mensajes'

// 7. Entidad: Administración & Plataforma
export * as AdminService from '../../services/adminService'
export { default as PanelAdminPage } from '../../pages/PanelAdmin'
