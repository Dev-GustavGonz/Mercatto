import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import adminService from '../services/adminService'
import AdminStats from '../components/admin/AdminStats'
import VendorsTable from '../components/admin/VendorsTable'
import CategoryManager from '../components/admin/CategoryManager'
import CouponManager from '../components/admin/CouponManager'
import SupportTicketsManager from '../components/admin/SupportTicketsManager'
import Spinner from '../components/common/Spinner'
import Modal from '../components/common/Modal'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatCurrency'
import {
  Shield,
  Store,
  Users,
  Grid,
  Tag,
  Search,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShoppingBag,
  MessageSquare,
  ShoppingCart,
  Eye,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Banknote,
  Headphones
} from 'lucide-react'

export const PanelAdmin = () => {
  const [tab, setTab] = useState('resumen') // 'resumen' | 'vendedores' | 'categorias' | 'cupones' | 'usuarios'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({})
  const [vendedores, setVendedores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [busquedaUsuario, setBusquedaUsuario] = useState('')
  const [filtroRolUsuario, setFiltroRolUsuario] = useState('TODOS')
  const [busquedaPedido, setBusquedaPedido] = useState('')
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState('TODOS')
  const [pedidoDetalleModal, setPedidoDetalleModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const { error: mostrarError, success: mostrarExito } = useToast()

  const cargarDatos = async () => {
    setLoading(true)
    const [stRes, vendsRes, usrsRes, ordsRes] = await Promise.allSettled([
      adminService.obtenerEstadisticas(),
      adminService.listarVendedores({ tamano: 500 }),
      adminService.listarUsuarios({ tamano: 500 }),
      adminService.listarPedidos({ tamano: 200 }),
    ])

    if (stRes.status === 'fulfilled') {
      setStats(stRes.value || {})
    } else {
      console.error('Error cargando estadísticas del admin:', stRes.reason)
    }

    if (vendsRes.status === 'fulfilled') {
      setVendedores(vendsRes.value?.content || [])
    } else {
      console.error('Error cargando vendedores:', vendsRes.reason)
      mostrarError(
        vendsRes.reason?.response?.data?.mensaje ||
          `No se pudieron cargar los vendedores (${vendsRes.reason?.response?.status || 'error de red'})`
      )
    }

    if (usrsRes.status === 'fulfilled') {
      setUsuarios(usrsRes.value?.content || [])
    } else {
      console.error('Error cargando usuarios:', usrsRes.reason)
    }

    if (ordsRes.status === 'fulfilled') {
      setPedidos(ordsRes.value?.content || [])
    } else {
      console.error('Error cargando pedidos:', ordsRes.reason)
    }

    setLoading(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (loading) {
    return <Spinner size="lg" className="py-32" />
  }

  const tiendasPendientes = vendedores.filter((v) => v.estado === 'PENDIENTE').length

  const navItems = [
    { id: 'resumen', label: 'Tablero Global', icon: LayoutDashboard, badge: null },
    { id: 'finanzas', label: 'Finanzas & Suscripciones', icon: DollarSign, badge: 'SaaS' },
    { id: 'pedidos', label: 'Pedidos del Marketplace', icon: ShoppingCart, badge: pedidos.length },
    { id: 'vendedores', label: 'Tiendas & Proveedores', icon: Store, badge: tiendasPendientes > 0 ? tiendasPendientes : vendedores.length },
    { id: 'categorias', label: 'Categorías & Árbol', icon: Grid, badge: null },
    { id: 'cupones', label: 'Cupones & Ofertas', icon: Tag, badge: null },
    { id: 'usuarios', label: 'Usuarios Registrados', icon: Users, badge: usuarios.length },
    { id: 'soporte', label: 'Tickets de Soporte', icon: Headphones, badge: 'Visitantes' },
    { id: 'mensajes', label: 'Supervisión de Chat', icon: MessageSquare, badge: null },
  ]

  return (
    <div className="min-h-[85vh] flex flex-col lg:flex-row gap-6 pb-20 max-w-[1600px] mx-auto">
      {/* Botón Móvil para abrir Sidebar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Mercatto Admin
            </h2>
            <span className="text-[11px] text-slate-400">Panel Global de Control</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR MODERNO DE ADMINISTRACIÓN */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl lg:shadow-none transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72 lg:rounded-3xl lg:border ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Header Super Admin */}
          <div className="space-y-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider border border-rose-100 dark:border-rose-900/50">
                <Shield size={12} />
                <span>Super Administrador</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                M
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  Control Central
                </h3>
                <span className="text-[11px] text-slate-400 block truncate">
                  Mercatto Marketplace
                </span>
              </div>
            </div>

            {/* Acceso a la tienda pública */}
            <Link
              to="/catalogo"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition text-xs font-bold border border-slate-200/60 dark:border-slate-700 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={14} className="text-rose-600" />
                <span>Inspeccionar Catálogo</span>
              </span>
              <ExternalLink size={13} className="text-slate-400" />
            </Link>
          </div>

          {/* Menú de Navegación Vertical */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Gestión del Marketplace
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              const activo = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activo
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={activo ? 'text-rose-400 dark:text-rose-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.id === 'vendedores' && tiendasPendientes > 0
                          ? 'bg-amber-400 text-slate-950 font-black animate-pulse'
                          : activo
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tarjeta inferior informativa */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-slate-50 dark:from-slate-800 dark:to-slate-850 border border-rose-100/60 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <Sparkles size={14} className="text-rose-500" />
              <span>Estado del Sistema</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Todas las APIs y pasarelas de pago se encuentran operativas en producción.
            </p>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO ADMIN */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Barra Superior */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Super Administrador</span>
              <ChevronRight size={13} />
              <span className="text-slate-700 dark:text-slate-300 font-bold capitalize">
                {navItems.find((n) => n.id === tab)?.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {tab === 'resumen' && 'Tablero de Control Global'}
              {tab === 'vendedores' && 'Aprobación y Gestión de Tiendas'}
              {tab === 'categorias' && 'Administración de Categorías'}
              {tab === 'cupones' && 'Campañas y Cupones de Descuento'}
              {tab === 'usuarios' && 'Directorio de Usuarios'}
              {tab === 'mensajes' && 'Supervisión y Auditoría de Conversaciones'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cargarDatos}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Actualizar Datos
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: RESUMEN GLOBAL */}
        {/* ============================================================== */}
        {tab === 'resumen' && (
          <div className="space-y-6">
            <AdminStats stats={stats} />

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setTab('vendedores')}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:-translate-y-1 transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Store size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tiendas & Vendedores
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {vendedores.length} registrados • {tiendasPendientes} solicitudes pendientes
                </p>
              </button>

              <button
                onClick={() => setTab('categorias')}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:-translate-y-1 transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Grid size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Árbol de Categorías
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Organiza y añade nuevas secciones al catálogo
                </p>
              </button>

              <button
                onClick={() => setTab('usuarios')}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:-translate-y-1 transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <Users size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Usuarios de la Plataforma
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {usuarios.length} compradores y vendedores activos
                </p>
              </button>

              <button
                onClick={() => setTab('pedidos')}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:-translate-y-1 transition group"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <ShoppingCart size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Auditoría de Pedidos
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {pedidos.length} órdenes registradas en el marketplace
                </p>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA: PEDIDOS DEL MARKETPLACE (AUDITORÍA GLOBAL) */}
        {/* ============================================================== */}
        {tab === 'pedidos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busquedaPedido}
                  onChange={(e) => setBusquedaPedido(e.target.value)}
                  placeholder="Buscar por código #PED, cliente o ciudad..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                />
                {busquedaPedido && (
                  <button
                    onClick={() => setBusquedaPedido('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['TODOS', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map((est) => (
                  <button
                    key={est}
                    onClick={() => setFiltroEstadoPedido(est)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      filtroEstadoPedido === est
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4">Código</th>
                      <th className="p-4">Comprador</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Despacho / Guía</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pedidos
                      .filter((p) => {
                        const coincideEstado = filtroEstadoPedido === 'TODOS' || p.estado === filtroEstadoPedido
                        const q = busquedaPedido.toLowerCase().trim()
                        const coincideTexto =
                          !q ||
                          p.codigo?.toLowerCase().includes(q) ||
                          p.comprador?.nombre?.toLowerCase().includes(q) ||
                          p.direccion?.ciudad?.toLowerCase().includes(q)
                        return coincideEstado && coincideTexto
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {p.codigo}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900 dark:text-white">{p.comprador?.nombre}</p>
                            <span className="text-[11px] text-slate-400">{p.direccion?.ciudad}</span>
                          </td>
                          <td className="p-4 font-black text-slate-900 dark:text-white">
                            {formatCurrency(p.total)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.estado === 'ENTREGADO'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : p.estado === 'ENVIADO'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                                  : p.estado === 'CANCELADO'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}
                            >
                              {p.estado}
                            </span>
                          </td>
                          <td className="p-4">
                            {p.empresaEnvio ? (
                              <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                                  {p.empresaEnvio}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {p.guiaSeguimiento || 'Sin guía'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pendiente de despacho</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-400">
                            {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString('es-CO') : '-'}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setPedidoDetalleModal(p)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Detalle</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalle de Auditoría de Pedido */}
        {pedidoDetalleModal && (
          <Modal
            isOpen={true}
            onClose={() => setPedidoDetalleModal(null)}
            title={`Auditoría de Pedido: ${pedidoDetalleModal.codigo}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <p className="font-bold text-slate-800 dark:text-white">Datos de Entrega:</p>
                <p className="text-slate-600 dark:text-slate-300">
                  {pedidoDetalleModal.direccion?.nombreCompleto} — Tel: {pedidoDetalleModal.direccion?.telefono}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {pedidoDetalleModal.direccion?.direccion}, {pedidoDetalleModal.direccion?.ciudad}, {pedidoDetalleModal.direccion?.departamento}
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pedidoDetalleModal.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2.5 items-center">
                    <div className="flex items-center gap-2.5">
                      <img src={item.imagenUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.nombreProducto}</p>
                        <p className="text-[10px] text-slate-400">Tienda: {item.vendedor?.nombreTienda || 'Vendedor'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-600">{item.cantidad} x {formatCurrency(item.precioUnitario)}</p>
                      <p className="font-black text-rose-600">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-sm">
                <span>Total Auditado:</span>
                <span className="text-rose-600">{formatCurrency(pedidoDetalleModal.total)}</span>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================== */}
        {/* VISTA 2: TIENDAS Y PROVEEDORES */}
        {/* ============================================================== */}
        {tab === 'vendedores' && (
          <div className="space-y-4">
            <VendorsTable vendedores={vendedores} onActualizado={cargarDatos} />
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 3: CATEGORÍAS */}
        {/* ============================================================== */}
        {tab === 'categorias' && (
          <div className="space-y-4">
            <CategoryManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 4: CUPONES */}
        {/* ============================================================== */}
        {tab === 'cupones' && (
          <div className="space-y-4">
            <CouponManager />
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 5: USUARIOS */}
        {/* ============================================================== */}
        {tab === 'usuarios' && (
          <div className="space-y-4">
            {/* Filtros de Usuarios */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar usuario por nombre o correo electrónico..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
                />
                {busquedaUsuario && (
                  <button
                    onClick={() => setBusquedaUsuario('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['TODOS', 'COMPRADOR', 'VENDEDOR', 'ADMIN'].map((rol) => (
                  <button
                    key={rol}
                    onClick={() => setFiltroRolUsuario(rol)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      filtroRolUsuario === rol
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {rol}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Fecha Registro</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usuarios
                      .filter((u) => {
                        const coincideTexto =
                          !busquedaUsuario ||
                          u.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
                          u.email?.toLowerCase().includes(busquedaUsuario.toLowerCase())
                        const coincideRol = filtroRolUsuario === 'TODOS' || u.rol === filtroRolUsuario
                        return coincideTexto && coincideRol
                      })
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{u.nombre}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.rol === 'ADMIN'
                                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                  : u.rol === 'VENDEDOR'
                                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {u.activo ? 'Activo' : 'Suspendido'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">
                            {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CO') : '-'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.rol !== 'ADMIN' && (
                                <select
                                  value={u.rol}
                                  onChange={async (e) => {
                                    const nuevoRol = e.target.value
                                    try {
                                      await adminService.cambiarRolUsuario(u.id, nuevoRol)
                                      mostrarExito(`Rol de ${u.nombre} cambiado a ${nuevoRol}`)
                                      cargarDatos()
                                    } catch (err) {
                                      mostrarError('Error al cambiar rol')
                                    }
                                  }}
                                  className="text-[11px] font-bold p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
                                  title="Cambiar rol del usuario"
                                >
                                  <option value="COMPRADOR">Comprador</option>
                                  <option value="VENDEDOR">Vendedor</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              )}

                              {u.rol !== 'ADMIN' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await adminService.cambiarEstadoUsuario(u.id, !u.activo)
                                      mostrarExito(u.activo ? `Usuario ${u.nombre} suspendido` : `Usuario ${u.nombre} reactivado`)
                                      cargarDatos()
                                    } catch (err) {
                                      mostrarError('Error al modificar estado del usuario')
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                                    u.activo
                                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  }`}
                                >
                                  {u.activo ? 'Suspender' : 'Reactivar'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA: FINANZAS Y SUSCRIPCIONES (MONETIZACIÓN DEL ADMIN) */}
        {/* ============================================================== */}
        {tab === 'finanzas' && (() => {
          const ingresosSuscripciones = vendedores.reduce((acc, v) => {
            if (v.tipoSuscripcion === 'ELITE') return acc + 99000
            if (v.tipoSuscripcion === 'PRO') return acc + 49000
            return acc
          }, 0)

          const totalVentasMercado = pedidos.filter(p => p.estado !== 'CANCELADO').reduce((acc, p) => acc + (p.total || 0), 0)
          const comisionesEstimadas = totalVentasMercado * 0.05
          const cuponesAsumidos = pedidos.filter(p => p.estado !== 'CANCELADO').reduce((acc, p) => acc + (p.descuento || 0), 0)
          const gananciaNetaMercatto = (ingresosSuscripciones + comisionesEstimadas) - cuponesAsumidos

          return (
            <div className="space-y-6">
              {/* Header Hero Finanzas */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30">
                    <DollarSign size={14} />
                    <span>Panel de Monetización del Administrador</span>
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black">
                    Flujo de Caja, Membresías y Comisiones
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Visualiza tus ganancias por suscripciones de tiendas y comisiones por venta. Los descuentos de cupones de campaña son absorbidos por la plataforma para proteger las ganancias de tus vendedores.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Ganancia Neta Administrador
                  </span>
                  <span className="text-3xl font-black text-emerald-400">
                    {formatCurrency(gananciaNetaMercatto)}
                  </span>
                  <span className="text-[10px] text-slate-300 block mt-1">Suscripciones + Comisiones - Cupones</span>
                </div>
              </div>

              {/* Métricas Financieras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Ingresos Suscripciones (MRR)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(ingresosSuscripciones)}
                    </span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      {vendedores.filter(v => v.tipoSuscripcion !== 'STARTER').length} activas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">100% ganancia neta recurrente</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Volumen de Ventas</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(totalVentasMercado)}
                  </div>
                  <p className="text-[11px] text-slate-400">En {pedidos.length} órdenes procesadas</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Comisiones Retenidas</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(comisionesEstimadas)}
                  </div>
                  <p className="text-[11px] text-slate-400">Ingreso por intermediación (~5%)</p>
                </div>

                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Cupones Asumidos (Admin)</span>
                  <div className="text-2xl font-black text-rose-500">
                    -{formatCurrency(cuponesAsumidos)}
                  </div>
                  <p className="text-[11px] text-slate-400">Inversión en fidelización</p>
                </div>
              </div>

              {/* Tabla de Tiendas y Estado de Membresía */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      Liquidación de Tiendas y Planes de Suscripción
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visualiza qué plan tiene cada tienda, cuánto aporta a tus ingresos y sus datos para dispersión de pagos.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                        <th className="pb-3">Tienda / Marca</th>
                        <th className="pb-3">Membresía</th>
                        <th className="pb-3">Aporte Mensual</th>
                        <th className="pb-3">Comisión Marketplace</th>
                        <th className="pb-3">Datos Bancarios para Liquidación</th>
                        <th className="pb-3 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {vendedores.map((v) => {
                        const plan = v.tipoSuscripcion || 'STARTER'
                        const costoPlan = plan === 'ELITE' ? 99000 : plan === 'PRO' ? 49000 : 0
                        const comision = plan === 'ELITE' ? '2%' : plan === 'PRO' ? '5%' : '10%'

                        return (
                          <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="py-4">
                              <div className="font-bold text-slate-900 dark:text-white text-xs">
                                {v.nombreTienda}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {v.nombrePropietario || v.email}
                              </div>
                            </td>

                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider ${
                                plan === 'ELITE'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : plan === 'PRO'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {plan}
                              </span>
                            </td>

                            <td className="py-4 font-black text-slate-900 dark:text-white">
                              {costoPlan === 0 ? 'Gratis (Starter)' : `${formatCurrency(costoPlan)} / mes`}
                            </td>

                            <td className="py-4 font-bold text-indigo-600 dark:text-indigo-400">
                              {comision} por venta
                            </td>

                            <td className="py-4 text-[11px] text-slate-500">
                              {v.banco ? (
                                <span>{v.banco} • {v.cuentaBancaria}</span>
                              ) : (
                                <span className="text-slate-400 italic">Sin datos bancarios</span>
                              )}
                            </td>

                            <td className="py-4 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px]">
                                Al Día
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ============================================================== */}
        {/* VISTA 6: SUPERVISIÓN DE CHAT Y AUDITORÍA */}
        {/* ============================================================== */}
        {tab === 'mensajes' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs mb-2 border border-rose-400/30">
                  <Shield size={14} />
                  <span>Control de Integridad y Antifraude</span>
                </div>
                <h3 className="text-lg font-black">Centro de Supervisión de Mensajería Global</h3>
                <p className="text-xs text-slate-300 max-w-xl mt-1">
                  Como Administrador de Mercatto, tienes permisos de auditoría para monitorear todas las conversaciones entre compradores y vendedores, asegurando transacciones seguras dentro de la plataforma.
                </p>
              </div>

              <Link
                to="/mensajes"
                target="_blank"
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>Abrir Consola de Chat en Vivo</span>
                <ExternalLink size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                <span className="text-xs font-semibold text-slate-400">Política Antifraude</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Intercambio de Contacto</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  El sistema bloquea números de teléfono y enlaces de pago externos para proteger las transacciones.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                <span className="text-xs font-semibold text-slate-400">Tokens de Comprador</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monetización del Chat</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cada comprador consume 1 Token por mensaje enviado a los vendedores para evitar SPAM y consultas masivas no deseadas.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                <span className="text-xs font-semibold text-slate-400">Canal WebSocket STOMP</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Transmisión Instantánea</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Supervisa eventos de chat en tiempo real emitidos al canal seguro de administración <code>/topic/mensajes/admin</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Tickets de Soporte */}
        {tab === 'soporte' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SupportTicketsManager />
          </div>
        )}
      </main>
    </div>
  )
}

export default PanelAdmin
