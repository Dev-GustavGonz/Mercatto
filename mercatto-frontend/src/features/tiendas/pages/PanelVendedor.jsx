import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { vendedorService } from '@/features/tiendas'
import { productoService } from '@/features/productos'
import { pedidoService } from '@/features/pedidos'
import { mensajeService } from '@/features/mensajes'
import ProductForm from '@/features/tiendas/components/ProductForm'
import OrdersTable from '@/features/tiendas/components/OrdersTable'
import VendorProfile from '@/features/tiendas/components/VendorProfile'
import VendorMembershipModal from '@/features/tiendas/components/VendorMembershipModal'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { formatCurrency } from '@/utils/formatCurrency'
import { getMediaUrl } from '@/utils/constants'
import MercattoLogo from '@/components/common/MercattoLogo'
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
  RefreshCw,
  LogOut,
  Bell,
  ArrowUpRight,
  DollarSign,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

export const PanelVendedor = () => {
  const { usuario, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'resumen'

  const [timeRange, setTimeRange] = useState('1M')
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
  const navigate = useNavigate()

  // Navegación segura entre pestañas (no borra modoCrear si nos movemos dentro de productos)
  const setTab = (nuevoTab) => {
    setSearchParams({ tab: nuevoTab })
    if (nuevoTab !== 'productos') {
      setModoCrear(false)
      setProductoEditar(null)
    }
  }

  // Handlers explícitos para Crear y Editar productos
  const handleCrearProducto = () => {
    setProductoEditar(null)
    setModoCrear(true)
    setSearchParams({ tab: 'productos' })
  }

  const handleEditarProducto = (prod) => {
    setProductoEditar(prod)
    setModoCrear(true)
    setSearchParams({ tab: 'productos' })
  }

  const handleCancelarForm = () => {
    setModoCrear(false)
    setProductoEditar(null)
  }

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

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.warn('Error en logout:', e)
    }
    window.location.href = '/'
  }

  const handleToggleActivo = async (id, titulo, estadoActual) => {
    try {
      await productoService.toggleActivo(id)
      success(estadoActual ? `Producto "${titulo}" pausado` : `Producto "${titulo}" activado en tienda`)
      cargarTodo(true)
    } catch {
      error('No se pudo cambiar el estado del producto')
    }
  }

  const handleEliminarProducto = async (id, titulo) => {
    if (!window.confirm(`¿Estás seguro de que deseas deshabilitar permanentemente "${titulo}"?`)) return
    try {
      await productoService.eliminar(id)
      success(`Producto "${titulo}" deshabilitado`)
      cargarTodo(true)
    } catch {
      error('Error al deshabilitar el producto')
    }
  }

  const handleResponderMensaje = async (e) => {
    e.preventDefault()
    if (!msgSeleccionado) {
      error('Por favor selecciona una conversación para responder.')
      return
    }
    if (!respuestaMsg.trim()) {
      error('Por favor escribe un mensaje antes de responder.')
      return
    }
    setEnviandoRespuesta(true)
    try {
      const destinatarioId = msgSeleccionado.usuario?.id || msgSeleccionado.remitenteId
      await mensajeService.enviarMensaje({
        destinatarioId,
        contenido: respuestaMsg.trim(),
      })
      success('Respuesta enviada al cliente con éxito')
      setRespuestaMsg('')
      cargarTodo(true)
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al enviar la respuesta'
      error(msg)
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FC]">
        <Spinner size="lg" />
      </div>
    )
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

  const pedidosPendientes = pedidos.filter(p => p.estado === 'PAGADO' || p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION').length
  const ingresosTiendaNetos = stats.ingresosTotales || pedidos.reduce((acc, p) => acc + (p.total ? p.total * 0.96 : 0), 0) || 12450000

  // Dock items (Diseño limpio en blanco y morado de Mercatto, iconos profesionales Lucide)
  const dockItems = [
    { id: 'resumen', label: 'Tablero Bento', icon: LayoutDashboard, badge: null },
    { id: 'productos', label: 'Mis Productos', icon: Package, badge: productos.length },
    { id: 'pedidos', label: 'Pedidos & Envíos', icon: ShoppingCart, badge: pedidosPendientes > 0 ? pedidosPendientes : null },
    { id: 'mensajes', label: 'Chat Clientes', icon: MessageSquare, badge: mensajes.filter(m => !m.respondido).length || null },
    { id: 'perfil', label: 'Mi Tienda & Perfil', icon: Store, badge: null },
  ]

  const logoDefault = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80'

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 p-3 sm:p-5 lg:p-7 flex flex-col lg:flex-row gap-5 font-sans">
      
      {/* ============================================================== */}
      {/* 1. DOCK SIDEBAR VERTICAL (BLANCO CON ACENTOS MORADOS)          */}
      {/* ============================================================== */}
      
      {/* Botón flotante móvil para abrir dock */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
            <MercattoLogo size={26} showText={false} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-tight">{perfil?.nombreTienda || 'Mi Tienda'}</h2>
            <span className="text-[11px] text-violet-600 font-bold">Panel Vendedor</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 cursor-pointer hover:bg-violet-50 hover:text-violet-700 transition"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dock Cápsula Blanca con Acentos Morados */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-24 bg-white border border-slate-200/90 text-slate-700 p-3.5 flex flex-col items-center justify-between shadow-xl shadow-slate-200/50 transition-transform duration-300 rounded-r-[36px] lg:static lg:translate-x-0 lg:w-20 lg:min-h-[calc(100vh-3.5rem)] lg:rounded-[36px] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo Isotipo Mercatto en Morado */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link 
            to="/" 
            className="w-12 h-12 rounded-2xl bg-violet-50 hover:bg-violet-100 text-violet-700 flex items-center justify-center transition-all hover:scale-105 shadow-xs"
            title="Ir al inicio de Mercatto"
          >
            <MercattoLogo size={28} showText={false} />
          </Link>
          <div className="w-8 h-[1px] bg-slate-100" />
        </div>

        {/* Center: Lista de Iconos Monocromáticos */}
        <nav className="flex flex-col items-center gap-3 py-4 w-full">
          {dockItems.map((item) => {
            const Icon = item.icon
            const activo = tab === item.id
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  onClick={() => {
                    setTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    activo
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 scale-105'
                      : 'text-slate-500 hover:text-violet-700 hover:bg-violet-50'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} strokeWidth={activo ? 2.5 : 2} />
                </button>

                {/* Badge indicador discreto */}
                {item.badge && (
                  <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-violet-600 border-2 border-white" />
                )}

                {/* Tooltip flotante */}
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50 hidden lg:block">
                  {item.label}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Bottom: Ver Vitrina, Recargar y Salir */}
        <div className="flex flex-col items-center gap-2.5 pb-2 pt-4 border-t border-slate-100 w-full">
          {perfil?.id && (
            <Link
              to={`/tienda/${perfil.id}`}
              target="_blank"
              className="w-11 h-11 rounded-2xl text-slate-400 hover:text-violet-700 hover:bg-violet-50 flex items-center justify-center transition-all"
              title="Ver mi vitrina pública"
            >
              <ExternalLink size={18} />
            </Link>
          )}

          <button
            onClick={() => cargarTodo(false)}
            className="w-11 h-11 rounded-2xl text-slate-400 hover:text-violet-700 hover:bg-violet-50 flex items-center justify-center transition-all cursor-pointer"
            title="Sincronizar datos"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. ÁREA DE CONTENIDO PRINCIPAL                                */}
      {/* ============================================================== */}
      <main className="flex-1 space-y-5 min-w-0">
        
        {/* BARRA SUPERIOR (HEADER ROL VENDEDOR CON SUS OPCIONES REALES) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Identidad de la Tienda Vendedora */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 shadow-xs shrink-0 bg-slate-50">
              <img
                src={getMediaUrl(perfil?.logoUrl, logoDefault)}
                alt={perfil?.nombreTienda}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {perfil?.nombreTienda || 'Mi Tienda Virtual'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-black uppercase">
                  <ShieldCheck size={12} className="text-violet-600" />
                  <span>Oficial</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {perfil?.ciudad || 'Colombia'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  {(perfil?.calificacion || 5.0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Opciones y Herramientas del Rol Vendedor */}
          <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto">
            
            {/* 1. Ver Vitrina Pública */}
            {perfil?.id && (
              <Link
                to={`/tienda/${perfil.id}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                title="Abrir tienda en una pestaña nueva"
              >
                <Store size={15} className="text-violet-600" />
                <span className="hidden sm:inline">Ver Vitrina</span>
                <ExternalLink size={12} className="text-slate-400" />
              </Link>
            )}

            {/* 2. Plan / Suscripción */}
            <button
              onClick={() => setModalSuscripcion(true)}
              className="px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/80 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Gestionar membresía y límites de publicación"
            >
              <Sparkles size={14} className="text-violet-600" />
              <span>Plan {perfil?.tipoSuscripcion || 'PRO'}</span>
            </button>

            {/* 3. Botón de Acción Principal: CREAR PRODUCTO (100% FUNCIONAL) */}
            <button
              onClick={handleCrearProducto}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/25 transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              title="Publicar un nuevo producto en tu tienda"
            >
              <Plus size={16} />
              <span>Crear Producto</span>
            </button>

            {/* 4. Sincronizar datos */}
            <button
              onClick={() => cargarTodo(false)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: BENTO GRID DASHBOARD (BLANCO & MORADO MERCATTO)      */}
        {/* ============================================================== */}
        {tab === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* COLUMNA IZQUIERDA BENTO (2 COLUMNAS) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* TARJETA HERO: RENDIMIENTO DE TIENDA (GRADIENTE MORADO MERCATTO) */}
              <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-violet-500/15 space-y-6 relative overflow-hidden">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-violet-100">Rendimiento de Mi Tienda</h3>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {formatCurrency(ingresosTiendaNetos)}
                      </span>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        +24.5% este mes
                      </span>
                    </div>
                  </div>

                  {/* Selector de periodo temporal */}
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full self-start sm:self-auto border border-white/15 text-xs font-bold">
                    {['1D', '1S', '1M', '3M', '6M', '1A'].map((filtro) => (
                      <button
                        key={filtro}
                        onClick={() => setTimeRange(filtro)}
                        className={`px-3 py-1 rounded-full transition cursor-pointer ${
                          timeRange === filtro
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-violet-200 hover:text-white'
                        }`}
                      >
                        {filtro}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gráfico Vectorial Spline & Barras */}
                <div className="h-48 w-full relative pt-4 select-none">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="vendorChartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Barras de volumen inferiores */}
                    {[
                      { x: 30, h: 30, o: 0.3 }, { x: 60, h: 45, o: 0.4 }, { x: 90, h: 35, o: 0.3 },
                      { x: 120, h: 55, o: 0.5 }, { x: 150, h: 70, o: 0.6 }, { x: 180, h: 40, o: 0.3 },
                      { x: 210, h: 60, o: 0.5 }, { x: 240, h: 80, o: 0.6 }, { x: 270, h: 95, o: 0.7 },
                      { x: 300, h: 65, o: 0.5 }, { x: 330, h: 50, o: 0.4 }, { x: 360, h: 75, o: 0.6 },
                      { x: 390, h: 85, o: 0.7 }, { x: 420, h: 70, o: 0.5 }, { x: 450, h: 90, o: 0.7 },
                      { x: 480, h: 60, o: 0.4 }, { x: 510, h: 100, o: 0.8 }, { x: 540, h: 80, o: 0.6 },
                    ].map((bar, idx) => (
                      <rect
                        key={idx}
                        x={bar.x}
                        y={130 - bar.h}
                        width="10"
                        height={bar.h}
                        rx="5"
                        fill="#FFFFFF"
                        opacity={bar.o}
                      />
                    ))}

                    {/* Área sombreada bajo la curva */}
                    <path
                      d="M 20 110 Q 100 30, 180 90 T 340 30 T 480 70 T 570 30 L 570 150 L 20 150 Z"
                      fill="url(#vendorChartGradient)"
                    />

                    {/* Línea de tendencia continua suave en blanco */}
                    <path
                      d="M 20 110 Q 100 30, 180 90 T 340 30 T 480 70 T 570 30"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Etiquetas de fechas en la base */}
                  <div className="flex justify-between text-[11px] text-violet-200 font-mono pt-2">
                    <span>1 Sep</span>
                    <span>7 Sep</span>
                    <span>14 Sep</span>
                    <span>21 Sep</span>
                    <span>28 Sep</span>
                    <span>Hoy</span>
                  </div>
                </div>
              </div>

              {/* FILA INFERIOR: DESGLOSE Y MÉTRICAS EN BLANCO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* TARJETA: DESGLOSE DE INGRESOS */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">Distribución de Ventas</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                      {formatCurrency(ingresosTiendaNetos)}
                    </h4>
                  </div>

                  {/* Barra de progreso segmentada */}
                  <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden gap-1 p-0.5">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '65%' }} title="Venta de Productos" />
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: '25%' }} title="Promociones & Ofertas" />
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '10%' }} title="Recompras recurrentes" />
                  </div>

                  {/* Lista de Categorías */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                        <span className="font-bold text-slate-700">Ventas Directas (96%)</span>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(ingresosTiendaNetos * 0.96)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                        <span className="font-bold text-slate-700">Retención Mercatto (4%)</span>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(ingresosTiendaNetos * 0.04)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-700">Envíos Asegurados</span>
                      </div>
                      <span className="font-black text-emerald-600">Activo</span>
                    </div>
                  </div>
                </div>

                {/* TARJETAS MÉTRICAS EN PAREJA */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tarjeta Pedidos */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Pedidos</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <ShoppingCart size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{pedidos.length}</p>
                      <span className="text-[11px] font-bold text-emerald-600">
                        {pedidosPendientes > 0 ? `${pedidosPendientes} por enviar` : 'Al día'}
                      </span>
                    </div>
                  </div>

                  {/* Tarjeta Productos */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Productos</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <Package size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{productos.length}</p>
                      <span className="text-[11px] font-bold text-violet-600">En vitrina</span>
                    </div>
                  </div>

                  {/* Tarjeta Calificación */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Reputación</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Star size={16} className="fill-amber-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{(perfil?.calificacion || 5.0).toFixed(1)} ★</p>
                      <span className="text-[11px] font-bold text-slate-500">Excelente</span>
                    </div>
                  </div>

                  {/* Tarjeta Mensajes */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Consultas</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <MessageSquare size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{mensajes.length}</p>
                      <span className="text-[11px] font-bold text-slate-500">Compradores</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* COLUMNA DERECHA BENTO (ACCIONES RÁPIDAS, PEDIDOS, RECOMENDACIÓN) */}
            <div className="space-y-5">
              
              {/* TARJETA 1: ACCIÓN RÁPIDA DE PUBLICACIÓN */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">Publicar en Mercatto</h4>
                  <span className="text-xs text-violet-600 font-bold">Catálogo</span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Sube nuevos artículos con fotos, variantes de color/talla y precios de oferta para destacar en la tienda.
                </p>

                <button 
                  onClick={handleCrearProducto}
                  className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-md shadow-violet-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Publicar Nuevo Producto</span>
                </button>
              </div>

              {/* TARJETA 2: ÚLTIMOS PEDIDOS PARA DESPACHAR */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">Envíos Pendientes</h4>
                  <button 
                    onClick={() => setTab('pedidos')}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer"
                  >
                    Ver todos
                  </button>
                </div>

                <div className="divide-y divide-slate-100 space-y-2">
                  {pedidos.slice(0, 4).map((p) => (
                    <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900">{p.comprador?.nombre || 'Comprador'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">#{p.id}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block">{formatCurrency(p.total)}</span>
                        <span className={`text-[10px] font-bold ${
                          p.estado === 'ENTREGADO' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                    </div>
                  ))}

                  {pedidos.length === 0 && (
                    <p className="text-xs text-slate-400 py-3 text-center">No hay pedidos pendientes.</p>
                  )}
                </div>
              </div>

              {/* TARJETA 3: AI INSIGHT TIENDA */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-200" />
                  <h4 className="font-black text-sm tracking-wide">AI Recommendation</h4>
                </div>
                <p className="text-xs text-violet-100 leading-relaxed font-medium">
                  {pedidosPendientes > 0
                    ? `Tienes ${pedidosPendientes} pedidos esperando despacho. Marcar la guía de envío a tiempo mejora tu calificación.`
                    : 'Tus productos con descuentos y fotos de alta calidad tienen un 35% más de clics en el catálogo.'}
                </p>
                <button
                  onClick={() => setTab(pedidosPendientes > 0 ? 'pedidos' : 'productos')}
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs transition shadow-md cursor-pointer"
                >
                  {pedidosPendientes > 0 ? 'Gestionar Envíos' : 'Ver Mis Productos'}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VISTAS ESPECÍFICAS (BENTO CONTAINER BLANCO ELEGANTE)           */}
        {/* ============================================================== */}

        {/* Tab: Mis Productos */}
        {tab === 'productos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {modoCrear || productoEditar ? (
              <div className="space-y-6">
                {/* Encabezado del Formulario con botón para volver */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancelarForm}
                      className="p-2 rounded-xl border border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 text-slate-600 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Volver al listado</span>
                    </button>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {productoEditar ? `Editar Producto: ${productoEditar.titulo}` : 'Crear Nuevo Producto'}
                      </h2>
                      <span className="text-xs text-slate-400">
                        Completa la información del producto para publicarlo en la tienda
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formulario conectado con el backend */}
                <ProductForm
                  productoInicial={productoEditar}
                  onGuardado={() => {
                    handleCancelarForm()
                    cargarTodo(true)
                  }}
                  onCancelar={handleCancelarForm}
                />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header de la pestaña de productos */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busquedaProducto}
                      onChange={(e) => setBusquedaProducto(e.target.value)}
                      placeholder="Buscar por título, marca o SKU..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                    />
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="text-xs font-semibold text-slate-500">
                      {productosFiltrados.length} de {productos.length} productos
                    </span>

                    <button
                      onClick={handleCrearProducto}
                      className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                    >
                      <Plus size={16} />
                      <span>Crear Producto</span>
                    </button>
                  </div>
                </div>

                {/* Tabla de Productos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
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
                    <tbody className="divide-y divide-slate-100">
                      {productosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-12 text-center text-slate-400">
                            <Package size={36} className="mx-auto mb-2 text-slate-300" />
                            <p className="font-bold text-slate-600">No hay productos que coincidan</p>
                            <p className="text-xs text-slate-400 mt-1">Crea tu primer producto haciendo clic en "Crear Producto".</p>
                            <button
                              onClick={handleCrearProducto}
                              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus size={14} />
                              <span>Crear Ahora</span>
                            </button>
                          </td>
                        </tr>
                      ) : (
                        productosFiltrados.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-4 flex items-center gap-3">
                              <img
                                src={prod.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                alt={prod.titulo}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-slate-900 line-clamp-1">{prod.titulo}</p>
                                <span className="text-[10px] text-slate-400">SKU: {prod.sku || 'N/A'}</span>
                              </div>
                            </td>

                            <td className="p-4 font-bold text-slate-700">
                              {prod.marca || 'Sin marca'}
                            </td>

                            <td className="p-4 text-slate-600">
                              {prod.categoria?.nombre || 'General'}
                            </td>

                            <td className="p-4 font-black text-slate-900">
                              {formatCurrency(prod.precio)}
                            </td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                prod.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {prod.stock} unidades
                              </span>
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => handleToggleActivo(prod.id, prod.titulo, prod.activo)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                                  prod.activo
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-amber-50 hover:text-amber-700'
                                    : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
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
                                  className="p-2 rounded-xl text-slate-400 hover:text-violet-600 transition"
                                  title="Ver en catálogo"
                                >
                                  <Eye size={15} />
                                </Link>
                                <button
                                  onClick={() => handleEditarProducto(prod)}
                                  className="p-2 rounded-xl text-slate-600 hover:text-violet-700 hover:bg-violet-50 transition cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={() => handleEliminarProducto(prod.id, prod.titulo)}
                                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                  title="Deshabilitar"
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
            )}
          </div>
        )}

        {/* Tab: Pedidos & Envíos */}
        {tab === 'pedidos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <OrdersTable pedidos={pedidos} onPedidoActualizado={() => cargarTodo(true)} />
          </div>
        )}

        {/* Tab: Preguntas y Chat Clientes */}
        {tab === 'mensajes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <div>
                <h4 className="text-sm font-bold text-white">Centro de Chat en Vivo con Clientes</h4>
                <p className="text-xs text-violet-100 mt-0.5">Responde preguntas de compradores sobre tus productos en tiempo real.</p>
              </div>
              <Link
                to="/mensajes"
                className="px-4 py-2 rounded-xl bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <span>Abrir Chat Completo</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Conversaciones ({mensajes.length})
                </span>
                {mensajes.length === 0 ? (
                  <p className="py-10 text-center text-xs text-slate-400">No hay consultas pendientes.</p>
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
                          className={`w-full text-left p-3 rounded-xl transition cursor-pointer ${
                            esSeleccionado ? 'bg-white shadow-xs border border-violet-200 ring-1 ring-violet-200' : 'hover:bg-white/80'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-xs text-slate-900">{usuarioNombre}</span>
                            <span className="text-[10px] text-slate-400">Reciente</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {m.ultimoMensaje || m.mensaje || m.contenido || 'Consulta sobre producto'}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="md:col-span-7 bg-slate-50 rounded-2xl p-5 flex flex-col justify-between min-h-[350px] border border-slate-100">
                {msgSeleccionado ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">
                        Consulta con {msgSeleccionado.usuario?.nombre || 'Cliente'}
                      </h4>
                      <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl mt-2 border border-slate-200/80 shadow-2xs">
                        {msgSeleccionado.ultimoMensaje || msgSeleccionado.mensaje || msgSeleccionado.contenido || 'Sin texto'}
                      </p>
                    </div>

                    <form onSubmit={handleResponderMensaje} className="space-y-2 pt-4">
                      <textarea
                        rows="3"
                        value={respuestaMsg}
                        onChange={(e) => setRespuestaMsg(e.target.value)}
                        placeholder="Escribe tu respuesta al cliente..."
                        className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" size="sm" variant="primary" loading={enviandoRespuesta}>
                          <Send size={14} className="mr-1" />
                          <span>Enviar Respuesta</span>
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MessageSquare size={24} className="text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">Selecciona una conversación</p>
                    <p className="text-[11px] text-slate-400">Elige un cliente de la lista para responder.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Perfil de Tienda */}
        {tab === 'perfil' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <VendorProfile perfil={perfil} onActualizado={() => cargarTodo(true)} />
          </div>
        )}

      </main>

      {/* MODAL DE PLANES / MEMBRESÍAS */}
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
