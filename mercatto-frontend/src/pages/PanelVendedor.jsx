import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import vendedorService from '../services/vendedorService'
import productoService from '../services/productoService'
import pedidoService from '../services/pedidoService'
import mensajeService from '../services/mensajeService'
import VendorStats from '../components/vendor/VendorStats'
import ProductForm from '../components/vendor/ProductForm'
import OrdersTable from '../components/vendor/OrdersTable'
import VendorProfile from '../components/vendor/VendorProfile'
import VendorMembershipModal from '../components/vendor/VendorMembershipModal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { formatCurrency } from '../utils/formatCurrency'
import { getMediaUrl } from '../utils/constants'
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Send,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Star,
  MapPin,
  CheckCircle2,
  Eye,
  Tag,
  Power,
  Check
} from 'lucide-react'

export const PanelVendedor = () => {
  const { usuario } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'resumen'
  const setTab = (nuevoTab) => {
    setSearchParams({ tab: nuevoTab })
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({})
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [pedidos, setPedidos] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)

  const { success, error } = useToast()
  const [modoCrear, setModoCrear] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [respuestaMsg, setRespuestaMsg] = useState('')
  const [msgSeleccionado, setMsgSeleccionado] = useState(null)
  const [modalSuscripcion, setModalSuscripcion] = useState(false)
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)

  const cargarTodo = async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const [st, pf, pds, ords, msgs] = await Promise.all([
        vendedorService.obtenerEstadisticas().catch(() => ({})),
        vendedorService.obtenerPerfil().catch(() => null),
        vendedorService.obtenerMisProductos({ pagina: 0, tamano: 50 }).catch(() => ({ content: [] })),
        pedidoService.pedidosVendedor().catch(() => ({ content: [] })),
        mensajeService.obtenerContactos().catch(() => []),
      ])
      setStats(st || {})
      setPerfil(pf)
      setProductos(pds?.content || [])
      setPedidos(ords?.content || [])
      setMensajes(Array.isArray(msgs) ? msgs : (msgs?.content || []))
    } catch (err) {
      console.error('Error al cargar panel de vendedor:', err)
      error('Error al sincronizar datos del panel')
    } finally {
      if (!silencioso) setLoading(false)
    }
  }

  useEffect(() => {
    cargarTodo(false)
  }, [])

  const handleToggleActivo = async (id, titulo, estadoActual) => {
    try {
      await productoService.toggleActivo(id)
      success(estadoActual ? `Producto "${titulo}" pausado` : `Producto "${titulo}" activado en tienda`)
      cargarTodo()
    } catch (err) {
      console.error(err)
      error('No se pudo cambiar el estado del producto')
    }
  }

  const handleEliminarProducto = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas deshabilitar permanentemente "${titulo}"?`)) return
    try {
      await productoService.eliminar(id)
      success(`Producto "${titulo}" deshabilitado`)
      cargarTodo()
    } catch (err) {
      console.error(err)
      error('Error al deshabilitar el producto')
    }
  }

  const handleResponderMensaje = async (e) => {
    e.preventDefault()
    if (!respuestaMsg.trim() || !msgSeleccionado) return
    setEnviandoRespuesta(true)
    try {
      const destinatarioId = msgSeleccionado.usuario?.id || msgSeleccionado.remitenteId
      await mensajeService.enviarMensaje({
        destinatarioId,
        contenido: respuestaMsg.trim(),
        productoId: msgSeleccionado.productoId || null,
      })
      success('Respuesta enviada al cliente')
      setRespuestaMsg('')
      setMsgSeleccionado(null)
      cargarTodo()
    } catch (err) {
      console.error(err)
      error('Error al enviar la respuesta')
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  if (loading) {
    return <Spinner size="lg" className="py-32" />
  }

  // Filtrado de productos del vendedor
  const productosFiltrados = productos.filter((p) => {
    if (!busquedaProducto.trim()) return true
    const q = busquedaProducto.toLowerCase()
    return (
      p.titulo?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.marca?.toLowerCase().includes(q)
    )
  })

  // Menú de navegación lateral
  const navItems = [
    { id: 'resumen', label: 'Resumen General', icon: LayoutDashboard, badge: null },
    { id: 'productos', label: 'Mis Productos', icon: Package, badge: productos.length },
    { id: 'pedidos', label: 'Pedidos & Envíos', icon: ShoppingCart, badge: pedidos.filter(p => p.estado === 'PAGADO' || p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION').length || null },
    { id: 'mensajes', label: 'Preguntas & Chat', icon: MessageSquare, badge: mensajes.filter(m => !m.respondido).length || null },
    { id: 'perfil', label: 'Datos de Tienda', icon: Settings, badge: null },
  ]

  const logoDefault = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80'

  return (
    <div className="min-h-[85vh] flex flex-col lg:flex-row gap-6 pb-20 max-w-[1600px] mx-auto">
      {/* Botón Móvil para abrir Sidebar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Store size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {perfil?.nombreTienda || 'Mi Tienda'}
            </h2>
            <span className="text-[11px] text-slate-400">Espacio de Proveedor</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR MODERNO ESTILO STRIPE / SHOPIFY */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl lg:shadow-none transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72 lg:rounded-3xl lg:border ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Encabezado de la Tienda */}
          <div className="space-y-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/50">
                <ShieldCheck size={12} />
                <span>Proveedor Activo</span>
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                <img
                  src={getMediaUrl(perfil?.logoUrl, logoDefault)}
                  alt={perfil?.nombreTienda}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {perfil?.nombreTienda || 'Mi Tienda Virtual'}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <MapPin size={11} />
                    {perfil?.ciudad || 'Colombia'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star size={11} className="fill-amber-500" />
                    {(perfil?.calificacion || 5.0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Acceso a Vitrina Pública */}
            {perfil?.id && (
              <Link
                to={`/tienda/${perfil.id}`}
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition text-xs font-bold border border-slate-200/60 dark:border-slate-700 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Store size={14} className="text-indigo-600" />
                  <span>Ver Mi Vitrina Pública</span>
                </span>
                <ExternalLink size={13} className="text-slate-400" />
              </Link>
            )}
          </div>

          {/* Menú de Navegación Vertical */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Gestión Comercial
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              const activo = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id)
                    setModoCrear(false)
                    setProductoEditar(null)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activo
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={activo ? 'text-indigo-400 dark:text-indigo-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        activo
                          ? 'bg-indigo-500 text-white'
                          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
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

        {/* Tarjeta inferior informativa de Suscripción */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-amber-50/50 dark:from-slate-800 dark:to-slate-850 border border-indigo-100/80 dark:border-slate-700 text-xs space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Membresía</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                perfil?.tipoSuscripcion === 'ELITE'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : perfil?.tipoSuscripcion === 'PRO'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {perfil?.tipoSuscripcion || 'STARTER'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {perfil?.tipoSuscripcion === 'ELITE'
                ? 'Tienes el plan máximo con comisiones del 2% y vitrina destacada.'
                : perfil?.tipoSuscripcion === 'PRO'
                ? 'Disfrutas del 5% de comisión e insignia verificada.'
                : 'Pasa a PRO o ELITE para reducir comisiones por venta.'}
            </p>
            <button
              type="button"
              onClick={() => setModalSuscripcion(true)}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-[11px] transition shadow cursor-pointer text-center flex items-center justify-center gap-1"
            >
              <span>{perfil?.tipoSuscripcion === 'ELITE' ? 'Gestionar Plan' : '⚡ Mejorar Mi Plan'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTENIDO */}
      <main className="flex-1 space-y-6 min-w-0">
        {/* Barra Superior de la Sección */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Panel de Vendedor</span>
              <ChevronRight size={13} />
              <span className="text-slate-700 dark:text-slate-300 font-bold capitalize">
                {navItems.find((n) => n.id === tab)?.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {tab === 'resumen' && 'Tablero de Control'}
              {tab === 'productos' && (modoCrear ? 'Publicar Nuevo Producto' : productoEditar ? 'Editar Producto' : 'Catálogo de Productos')}
              {tab === 'pedidos' && 'Gestión de Pedidos & Envíos'}
              {tab === 'mensajes' && 'Preguntas de Compradores'}
              {tab === 'perfil' && 'Configuración de la Tienda'}
            </h1>
          </div>

          {/* Botón de Acción Rápida */}
          <div className="flex items-center gap-2">
            {tab !== 'productos' || (!modoCrear && !productoEditar) ? (
              <button
                onClick={() => {
                  setProductoEditar(null)
                  setModoCrear(true)
                  setTab('productos')
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Plus size={16} />
                <span>Nuevo Producto</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setModoCrear(false)
                  setProductoEditar(null)
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Volver a la lista
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: RESUMEN GENERAL (DASHBOARD) */}
        {/* ============================================================== */}
        {tab === 'resumen' && (
          <div className="space-y-6">
            {/* Tarjetas de Métricas Ejecutivas */}
            <VendorStats stats={stats} />

            {/* Accesos rápidos & Resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actividad Reciente de Pedidos */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Últimos Pedidos Recibidos
                    </h3>
                  </div>
                  <button
                    onClick={() => setTab('pedidos')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Ver todos ({pedidos.length}) →
                  </button>
                </div>

                {pedidos.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Aún no tienes pedidos registrados. Tus ventas aparecerán aquí.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pedidos.slice(0, 4).map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center font-bold">
                            #{p.id}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {p.comprador?.nombre || 'Comprador'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString() : 'Hoy'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-black text-slate-900 dark:text-white">
                            {formatCurrency(p.total)}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {p.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acciones Rápidas y Atajos */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  <span>Acciones de Tienda</span>
                </h3>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setProductoEditar(null)
                      setModoCrear(true)
                      setTab('productos')
                    }}
                    className="w-full p-3 rounded-2xl bg-indigo-50/60 dark:bg-slate-800 hover:bg-indigo-100/70 dark:hover:bg-slate-700/60 transition text-left flex items-center gap-3 border border-indigo-100/50 dark:border-slate-700"
                  >
                    <div className="p-2 rounded-xl bg-indigo-600 text-white">
                      <Plus size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block">
                        Agregar Producto
                      </span>
                      <span className="text-[10px] text-slate-500">Publicar con fotos y marca</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setTab('mensajes')}
                    className="w-full p-3 rounded-2xl bg-amber-50/60 dark:bg-slate-800 hover:bg-amber-100/70 dark:hover:bg-slate-700/60 transition text-left flex items-center gap-3 border border-amber-100/50 dark:border-slate-700"
                  >
                    <div className="p-2 rounded-xl bg-amber-500 text-white">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                        Atender Mensajes
                      </span>
                      <span className="text-[10px] text-slate-500">{mensajes.length} conversaciones registradas</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setTab('perfil')}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition text-left flex items-center gap-3 border border-slate-200/60 dark:border-slate-700"
                  >
                    <div className="p-2 rounded-xl bg-slate-700 text-white">
                      <Settings size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Configurar Tienda
                      </span>
                      <span className="text-[10px] text-slate-500">Ciudad, logo y cuenta bancaria</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 2: MIS PRODUCTOS (TABLA MODERNA + FORM) */}
        {/* ============================================================== */}
        {tab === 'productos' && (
          <div className="space-y-6">
            {modoCrear || productoEditar ? (
              <ProductForm
                productoInicial={productoEditar}
                onGuardado={() => {
                  setModoCrear(false)
                  setProductoEditar(null)
                  cargarTodo()
                }}
                onCancelar={() => {
                  setModoCrear(false)
                  setProductoEditar(null)
                }}
              />
            ) : (
              <div className="space-y-4">
                {/* Buscador y Contador */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      placeholder="Buscar por título, marca o SKU..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                    {busquedaProducto && (
                      <button
                        onClick={() => setBusquedaProducto('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 self-center">
                    Mostrando {productosFiltrados.length} de {productos.length} productos publicados
                  </span>
                </div>

                {/* Tabla de Productos */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-4">Producto</th>
                          <th className="p-4">Marca</th>
                          <th className="p-4">Categoría</th>
                          <th className="p-4">Precio</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {productosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-slate-400">
                              No tienes productos que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          productosFiltrados.map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                              <td className="p-4 flex items-center gap-3">
                                <img
                                  src={prod.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                  alt={prod.titulo}
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.titulo}</p>
                                  <span className="text-[10px] text-slate-400">SKU: {prod.sku || 'N/A'}</span>
                                </div>
                              </td>

                              <td className="p-4">
                                {prod.marca ? (
                                  <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-100 dark:border-slate-700">
                                    {prod.marca}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Sin marca</span>
                                )}
                              </td>

                              <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                                {prod.categoria?.nombre || 'General'}
                              </td>

                              <td className="p-4">
                                <span className="font-black text-slate-900 dark:text-white">
                                  ${prod.precio}
                                </span>
                                {prod.precioOferta && (
                                  <span className="text-[10px] text-slate-400 line-through block">
                                    ${prod.precioOferta}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                    prod.stock > 5
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : prod.stock > 0
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                                  }`}
                                >
                                  {prod.stock} disponibles
                                </span>
                              </td>

                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleActivo(prod.id, prod.titulo, prod.activo)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                    prod.activo
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-amber-50 hover:text-amber-700'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                                  }`}
                                  title={prod.activo ? 'Clic para pausar venta' : 'Clic para activar venta'}
                                >
                                  <Power size={11} />
                                  <span>{prod.activo ? 'Activo' : 'Pausado'}</span>
                                </button>
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    to={`/producto/${prod.id}`}
                                    target="_blank"
                                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    title="Ver en tienda pública"
                                  >
                                    <Eye size={15} />
                                  </Link>
                                  <button
                                    onClick={() => {
                                      setProductoEditar(prod)
                                      setModoCrear(false)
                                    }}
                                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit size={15} />
                                  </button>
                                  <button
                                    onClick={() => handleEliminarProducto(prod.id, prod.titulo)}
                                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title="Deshabilitar producto"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 3: PEDIDOS & ENVÍOS */}
        {/* ============================================================== */}
        {tab === 'pedidos' && (
          <div className="space-y-4">
            <OrdersTable pedidos={pedidos} onPedidoActualizado={cargarTodo} />
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 4: PREGUNTAS Y CHAT DE CLIENTES */}
        {/* ============================================================== */}
        {tab === 'mensajes' && (
          <div className="space-y-4">
            {/* Banner de Acceso a Chat en Vivo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Centro de Chat en Vivo con Clientes</h4>
                  <p className="text-xs text-slate-300">Conversa en tiempo real mediante WebSockets con compradores que preguntan por tus productos.</p>
                </div>
              </div>
              <Link
                to="/mensajes"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow whitespace-nowrap"
              >
                <span>Abrir Chat en Tiempo Real</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Conversaciones ({mensajes.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">Tiempo real</span>
              </div>
              {mensajes.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No tienes mensajes ni consultas de clientes aún.
                </div>
              ) : (
                <div className="space-y-1">
                  {mensajes.map((m, idx) => {
                    const usuarioNombre = m.usuario?.nombre || m.destinatarioNombre || 'Cliente'
                    const esSeleccionado = (msgSeleccionado?.usuario?.id && msgSeleccionado.usuario.id === m.usuario?.id) || msgSeleccionado?.id === m.id
                    return (
                      <button
                        key={m.usuario?.id || m.id || idx}
                        onClick={() => {
                          setMsgSeleccionado(m)
                          setRespuestaMsg('')
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition cursor-pointer ${
                          esSeleccionado
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {usuarioNombre}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {m.fechaUltimoMensaje ? new Date(m.fechaUltimoMensaje).toLocaleDateString() : 'Reciente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {m.ultimoMensaje || m.mensaje || m.contenido || 'Consulta sobre producto'}
                        </p>
                        {m.noLeidos > 0 && (
                          <div className="mt-1 flex justify-end">
                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                              {m.noLeidos} nuevo{m.noLeidos > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
              {msgSeleccionado ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          Conversación con {msgSeleccionado.usuario?.nombre || 'Cliente'}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {msgSeleccionado.usuario?.email || 'Comprador verificado'}
                        </span>
                      </div>
                      <Link
                        to="/mensajes"
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                      >
                        <span>Chat Completo</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                      <p className="font-semibold text-slate-500 text-[10px] uppercase mb-1">Último mensaje recibido:</p>
                      {msgSeleccionado.ultimoMensaje || msgSeleccionado.mensaje || msgSeleccionado.contenido || 'Sin texto'}
                    </div>
                  </div>

                  <form onSubmit={handleResponderMensaje} className="space-y-2 pt-4">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Responder al cliente:
                    </label>
                    <textarea
                      rows="3"
                      value={respuestaMsg}
                      onChange={(e) => setRespuestaMsg(e.target.value)}
                      placeholder="Escribe tu respuesta aquí para el comprador..."
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="submit" size="sm" variant="primary" loading={enviandoRespuesta}>
                        <Send size={14} className="mr-1" />
                        <span>Enviar Respuesta</span>
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                    <MessageSquare size={22} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Ninguna conversación seleccionada</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Elige un cliente del listado de la izquierda para responder sus dudas o abre el Chat en Tiempo Real.
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VISTA 5: CONFIGURACIÓN DE TIENDA */}
        {/* ============================================================== */}
        {tab === 'perfil' && (
          <VendorProfile perfil={perfil} onActualizado={() => cargarTodo(true)} />
        )}
      </main>

      {/* MODAL DE MEMBRESÍAS Y PLANES */}
      {modalSuscripcion && (
        <VendorMembershipModal
          perfil={perfil}
          onClose={() => setModalSuscripcion(false)}
          onActualizado={() => cargarTodo(true)}
        />
      )}
    </div>
  )
}

export default PanelVendedor
