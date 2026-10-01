// Feature Modules - Mercatto Domain Re-export Index
// Centraliza el acceso organizado por entidades en el frontend

// 1. Entidad: Auth & Cuenta
export * as AuthService from '@/features/auth'
export { default as LoginPage } from '@/features/auth/pages/Login'
export { default as RegistroPage } from '@/features/auth/pages/Registro'

// 2. Entidad: Productos & Catálogo
export * as ProductoService from '@/features/productos'
export { default as CatalogoPage } from '@/features/productos/pages/Catalogo'
export { default as DetalleProductoPage } from '@/features/productos/pages/DetalleProducto'
export { default as CategoriaPage } from '@/features/productos/pages/Categoria'
export { default as BusquedaPage } from '@/features/productos/pages/Busqueda'
export { default as FavoritosPage } from '@/features/productos/pages/Favoritos'

// 3. Entidad: Pedidos, Carrito & Pagos
export * as PedidoService from '@/features/pedidos'
export * as PagoService from '@/features/pedidos'
export { default as CarritoPage } from '@/features/pedidos/pages/Carrito'
export { default as CheckoutPage } from '@/features/pedidos/pages/Checkout'
export { default as MisPedidosPage } from '@/features/pedidos/pages/MisPedidos'
export { default as PagoExitosoPage } from '@/features/pedidos/pages/PagoExitoso'
export { default as PagoCanceladoPage } from '@/features/pedidos/pages/PagoCancelado'

// 4. Entidad: Tiendas & Vendedores
export * as VendedorService from '@/features/tiendas'
export * as TiendaService from '@/features/tiendas'
export { default as DirectorioTiendasPage } from '@/features/tiendas/pages/DirectorioTiendas'
export { default as VitrinaTiendaPage } from '@/features/tiendas/pages/VitrinaTienda'
export { default as PanelVendedorPage } from '@/features/tiendas/pages/PanelVendedor'

// 5. Entidad: Perfil de Usuario & Direcciones
export * as UsuarioService from '@/features/usuario'
export * as DireccionService from '@/features/usuario'
export { default as PerfilPage } from '@/features/usuario/pages/Perfil'

// 6. Entidad: Mensajería & Comunicación
export * as MensajeService from '@/features/mensajes'
export * as WebsocketService from '@/features/mensajes'
export { default as MensajesPage } from '@/features/mensajes/pages/Mensajes'

// 7. Entidad: Administración & Plataforma
export * as AdminService from '@/features/admin'
export { default as PanelAdminPage } from '@/features/admin/pages/PanelAdmin'
