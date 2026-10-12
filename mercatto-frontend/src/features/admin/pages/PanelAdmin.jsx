import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminService } from '@/features/admin'
import VendorsTable from '@/features/admin/components/VendorsTable'
import CategoryManager from '@/features/admin/components/CategoryManager'
import CouponManager from '@/features/admin/components/CouponManager'
import SupportTicketsManager from '@/features/admin/components/SupportTicketsManager'
import Spinner from '@/components/common/Spinner'
import Modal from '@/components/common/Modal'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/formatCurrency'
import MercattoLogo from '@/components/common/MercattoLogo'
import {
  LayoutDashboard,
  Store,
  Users,
  Grid,
  Tag,
  Search,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  ShoppingCart,
  Eye,
  CreditCard,
  DollarSign,
  TrendingUp,
  Headphones,
  Settings,
  LogOut,
  Bell,
  Package,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'

export const PanelAdmin = () => {
  const [tab, setTab] = useState('resumen')
  const [timeRange, setTimeRange] = useState('1M')
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

  const { usuario, logout } = useAuth()
  const { error: mostrarError, success: mostrarExito } = useToast()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.warn('Error en logout:', e)
    }
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F9FC]">
        <Spinner size="lg" />
      </div>
    )
  }

  const tiendasPendientes = vendedores.filter((v) => v.estado === 'PENDIENTE').length
  const totalVentasMercado = pedidos.filter(p => p.estado !== 'CANCELADO').reduce((acc, p) => acc + (p.total || 0), 0) || (stats.ingresosTotales || 48500000)
  const comisionesTotalesAdmin = totalVentasMercado * 0.04
  const totalNetoProveedores = totalVentasMercado * 0.96

  // Helper para identificar la tienda o proveedor de cada pedido en la auditoría del admin
  const obtenerTiendaPedido = (p) => {
    if (!p) return 'Tienda Oficial'
    if (p.nombreTienda) return p.nombreTienda
    if (p.items && p.items.length > 0) {
      const tiendas = [...new Set(p.items.map(i => i.nombreTienda).filter(Boolean))]
      if (tiendas.length > 0) return tiendas.join(', ')
    }
    return 'Tienda Marketplace'
  }

  // Dock items (Sin emojis, iconos profesionales Lucide en blanco y morado)
  const dockItems = [
    { id: 'resumen', label: 'Tablero Bento', icon: LayoutDashboard, badge: null },
    { id: 'finanzas', label: 'Finanzas & 4%', icon: DollarSign, badge: '4%' },
    { id: 'pedidos', label: 'Auditoría Pedidos', icon: ShoppingCart, badge: pedidos.length },
    { id: 'vendedores', label: 'Tiendas & Proveedores', icon: Store, badge: tiendasPendientes > 0 ? tiendasPendientes : null },
    { id: 'categorias', label: 'Árbol Categorías', icon: Grid, badge: null },
    { id: 'cupones', label: 'Cupones & Promos', icon: Tag, badge: null },
    { id: 'usuarios', label: 'Directorio Usuarios', icon: Users, badge: usuarios.length },
    { id: 'soporte', label: 'Tickets Soporte', icon: Headphones, badge: null },
    { id: 'mensajes', label: 'Supervisión Chat', icon: MessageSquare, badge: null },
  ]

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
            <h2 className="text-sm font-black text-slate-900 leading-tight">Mercatto Admin</h2>
            <span className="text-[11px] text-violet-600 font-bold">Control Central</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 cursor-pointer hover:bg-violet-50 hover:text-violet-700 transition"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Dock Cápsula Blanca */}
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

                {/* Tooltip flotante al pasar el cursor */}
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-50 hidden lg:block">
                  {item.label}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Bottom: Ver Catálogo, Recargar y Salir */}
        <div className="flex flex-col items-center gap-2.5 pb-2 pt-4 border-t border-slate-100 w-full">
          <Link
            to="/catalogo"
            target="_blank"
            className="w-11 h-11 rounded-2xl text-slate-400 hover:text-violet-700 hover:bg-violet-50 flex items-center justify-center transition-all"
            title="Inspeccionar Catálogo Público"
          >
            <ShoppingBag size={18} />
          </Link>

          <button
            onClick={cargarDatos}
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
        
        {/* BARRA SUPERIOR (HEADER ROL SUPER ADMIN CON HERRAMIENTAS REALES) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Título de Pestaña Activa + Badge de Super Admin */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {tab === 'resumen' && 'Tablero General del Marketplace'}
                  {tab === 'finanzas' && 'Liquidación & Comisiones (4%)'}
                  {tab === 'pedidos' && 'Auditoría Global de Pedidos'}
                  {tab === 'vendedores' && 'Aprobación y Control de Tiendas'}
                  {tab === 'categorias' && 'Gestión de Árbol de Categorías'}
                  {tab === 'cupones' && 'Campañas de Descuento & Promociones'}
                  {tab === 'usuarios' && 'Directorio de Usuarios y Roles'}
                  {tab === 'soporte' && 'Tickets y Asistencia al Cliente'}
                  {tab === 'mensajes' && 'Supervisión de Mensajería'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs font-black">
                  <ShieldCheck size={14} className="text-violet-600" />
                  <span>Super Admin</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Panel central de administración y auditoría de Mercatto
              </p>
            </div>
          </div>

          {/* Opciones Específicas del Rol Administrador */}
          <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto">
            
            {/* 1. Alerta de Tiendas Pendientes (con clic directo) */}
            {tiendasPendientes > 0 && (
              <button
                onClick={() => setTab('vendedores')}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Ver tiendas esperando aprobación"
              >
                <AlertCircle size={14} className="text-amber-600" />
                <span>{tiendasPendientes} Solicitudes</span>
              </button>
            )}

            {/* 2. Acceso directo a Catálogo Público */}
            <Link
              to="/catalogo"
              target="_blank"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
              title="Inspeccionar tienda pública en una pestaña nueva"
            >
              <ShoppingBag size={14} className="text-violet-600" />
              <span className="hidden sm:inline">Ver Catálogo</span>
              <ExternalLink size={12} className="text-slate-400" />
            </Link>

            {/* 3. Indicador Rápido de Comisión 4% */}
            <button
              onClick={() => setTab('finanzas')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Ver reporte financiero y comisión del 4%"
            >
              <DollarSign size={14} className="text-emerald-600" />
              <span>4% Mercatto</span>
            </button>

            {/* 4. Sincronizar datos */}
            <button
              onClick={cargarDatos}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Actualizar datos del sistema"
            >
              <RefreshCw size={15} />
            </button>

            {/* 5. Perfil Admin */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {usuario?.nombre?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden lg:inline">
                {usuario?.nombre || 'Administrador'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VISTA 1: BENTO GRID DASHBOARD (BLANCO & MORADO MERCATTO)      */}
        {/* ============================================================== */}
        {tab === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* COLUMNA IZQUIERDA BENTO (2 COLUMNAS) */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* TARJETA HERO: RENDIMIENTO MARKETPLACE (GRADIENTE MORADO MERCATTO) */}
              <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white rounded-[32px] p-6 sm:p-8 shadow-xl shadow-violet-500/15 space-y-6 relative overflow-hidden">
                {/* Header de la tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-violet-100">Rendimiento del Marketplace</h3>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {formatCurrency(totalVentasMercado)}
                      </span>
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        +16.8% este mes
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
                <div className="h-52 w-full relative pt-4 select-none">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="adminChartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Barras de volumen inferiores bicolores */}
                    {[
                      { x: 30, h: 35, o: 0.35 }, { x: 50, h: 48, o: 0.45 }, { x: 70, h: 60, o: 0.55 },
                      { x: 90, h: 40, o: 0.35 }, { x: 110, h: 25, o: 0.25 }, { x: 130, h: 55, o: 0.5 },
                      { x: 150, h: 70, o: 0.65 }, { x: 170, h: 45, o: 0.4 }, { x: 190, h: 30, o: 0.3 },
                      { x: 210, h: 65, o: 0.6 }, { x: 230, h: 80, o: 0.7 }, { x: 250, h: 95, o: 0.8 },
                      { x: 270, h: 40, o: 0.35 }, { x: 290, h: 75, o: 0.65 }, { x: 310, h: 85, o: 0.75 },
                      { x: 330, h: 50, o: 0.45 }, { x: 350, h: 30, o: 0.3 }, { x: 370, h: 65, o: 0.55 },
                      { x: 390, h: 100, o: 0.85 }, { x: 410, h: 85, o: 0.7 }, { x: 430, h: 45, o: 0.4 },
                      { x: 450, h: 70, o: 0.6 }, { x: 470, h: 90, o: 0.75 }, { x: 490, h: 60, o: 0.5 },
                      { x: 510, h: 40, o: 0.35 }, { x: 530, h: 75, o: 0.65 }, { x: 550, h: 110, o: 0.9 },
                    ].map((bar, idx) => (
                      <rect
                        key={idx}
                        x={bar.x}
                        y={140 - bar.h}
                        width="8"
                        height={bar.h}
                        rx="4"
                        fill="#FFFFFF"
                        opacity={bar.o}
                      />
                    ))}

                    {/* Área sombreada bajo la curva */}
                    <path
                      d="M 20 120 Q 100 40, 180 110 T 340 30 T 480 90 T 580 40 L 580 160 L 20 160 Z"
                      fill="url(#adminChartGradient)"
                    />

                    {/* Línea de tendencia continua suave en blanco */}
                    <path
                      d="M 20 120 Q 100 40, 180 110 T 340 30 T 480 90 T 580 40"
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

              {/* FILA INFERIOR: DESGLOSE Y MÉTRICAS BENTO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* TARJETA: DESGLOSE DE INGRESOS */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-400">Desglose de Comisiones (4%)</span>
                    <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                      {formatCurrency(comisionesTotalesAdmin)}
                    </h4>
                  </div>

                  {/* Barra de progreso segmentada */}
                  <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden gap-1 p-0.5">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '45%' }} title="Comisiones Marketplace" />
                    <div className="h-full bg-violet-400 rounded-full" style={{ width: '30%' }} title="Suscripciones Pro" />
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} title="Servicios de Envíos" />
                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '10%' }} title="Otros" />
                  </div>

                  {/* Lista de Categorías */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                        <span className="font-bold text-slate-700">Comisión 4% Ventas</span>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(comisionesTotalesAdmin * 0.75)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                        <span className="font-bold text-slate-700">Suscripciones Tiendas</span>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(comisionesTotalesAdmin * 0.20)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-700">Comisiones de Envíos</span>
                      </div>
                      <span className="font-black text-slate-900">{formatCurrency(comisionesTotalesAdmin * 0.05)}</span>
                    </div>
                  </div>
                </div>

                {/* TARJETAS MÉTRICAS EN PAREJA */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Tarjeta Usuarios */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Total Usuarios</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{usuarios.length || stats.totalUsuarios || 0}</p>
                      <span className="text-[11px] font-bold text-emerald-600">+12% este mes</span>
                    </div>
                  </div>

                  {/* Tarjeta Tiendas */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Tiendas</span>
                      <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                        <Store size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{vendedores.length || stats.totalVendedores || 0}</p>
                      <span className="text-[11px] font-bold text-violet-600">{tiendasPendientes} por verificar</span>
                    </div>
                  </div>

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
                      <span className="text-[11px] font-bold text-slate-500">Transacciones</span>
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
                      <p className="text-2xl font-black text-slate-900">{stats.totalProductos || 0}</p>
                      <span className="text-[11px] font-bold text-emerald-600">En catálogo</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* COLUMNA DERECHA BENTO (METAS, TRANSACCIONES, AI INSIGHT) */}
            <div className="space-y-5">
              
              {/* TARJETA 1: METAS DEL MARKETPLACE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">Objetivos del Mes</h4>
                  <span className="text-xs text-slate-400 font-bold">Q4 2026</span>
                </div>

                <div className="space-y-3.5">
                  {/* Meta 1: Ventas */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Volumen Ventas</span>
                      <span className="font-mono text-slate-500">85%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{formatCurrency(totalVentasMercado * 0.85)}</span>
                      <span>Meta: $60M COP</span>
                    </div>
                  </div>

                  {/* Meta 2: Nuevas Tiendas */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Tiendas Verificadas</span>
                      <span className="font-mono text-slate-500">60%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{vendedores.length} tiendas</span>
                      <span>Meta: 50 tiendas</span>
                    </div>
                  </div>

                  {/* Meta 3: Satisfacción */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">Entrega Exitosa</span>
                      <span className="font-mono text-slate-500">96%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Calidad de Envíos</span>
                      <span>Meta: 95%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setTab('finanzas')}
                  className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-md shadow-violet-500/20 cursor-pointer"
                >
                  Configurar Metas Financieras
                </button>
              </div>

              {/* TARJETA 2: TRANSACCIONES RECIENTES */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">Transacciones</h4>
                  <button 
                    onClick={() => setTab('pedidos')}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="divide-y divide-slate-100 space-y-2">
                  {pedidos.slice(0, 4).map((p) => (
                    <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-black text-slate-900">{p.comprador?.nombre || 'Comprador'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{p.codigo}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block">+{formatCurrency(p.total)}</span>
                        <span className={`text-[10px] font-bold ${
                          p.estado === 'ENTREGADO' ? 'text-emerald-600' : 'text-slate-500'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                    </div>
                  ))}

                  {pedidos.length === 0 && (
                    <p className="text-xs text-slate-400 py-3 text-center">No hay transacciones recientes.</p>
                  )}
                </div>
              </div>

              {/* TARJETA 3: AI INSIGHT (VIOLETA VIBRANTE) */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-200" />
                  <h4 className="font-black text-sm tracking-wide">Mercatto AI Insight</h4>
                </div>
                <p className="text-xs text-violet-100 leading-relaxed font-medium">
                  {tiendasPendientes > 0
                    ? `Tienes ${tiendasPendientes} tiendas a la espera de verificación. Aprobarlas acelerará la oferta en el catálogo.`
                    : 'Las ventas crecieron un 16.8% en los últimos 30 días. La categoría de Electrónica lidera las búsquedas.'}
                </p>
                <button
                  onClick={() => setTab(tiendasPendientes > 0 ? 'vendedores' : 'finanzas')}
                  className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
                >
                  {tiendasPendientes > 0 ? 'Ver Solicitudes' : 'Ver Detalles Financieros'}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VISTAS ESPECÍFICAS (BENTO CONTAINER BLANCO ELEGANTE)           */}
        {/* ============================================================== */}

        {/* Tab: Auditoría de Pedidos del Marketplace */}
        {tab === 'pedidos' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            {/* Cabecera Informativa de Auditoría */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-100">
                    Auditoría Marketplace
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Solo Supervisión Comercial</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Auditoría Global de Pedidos</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Supervisa las transacciones generadas en las tiendas. La preparación, empaque y despacho es responsabilidad exclusiva de cada vendedor asociado.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Pedidos</span>
                  <span className="text-base font-black text-slate-900">{pedidos.length}</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Comisión 4% Admin</span>
                  <span className="text-base font-black text-emerald-600">{formatCurrency(comisionesTotalesAdmin)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busquedaPedido}
                  onChange={(e) => setBusquedaPedido(e.target.value)}
                  placeholder="Buscar por tienda, código #PED, cliente o ciudad..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['TODOS', 'PAGADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].map((est) => (
                  <button
                    key={est}
                    onClick={() => setFiltroEstadoPedido(est)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      filtroEstadoPedido === est
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-violet-50 hover:text-violet-700'
                    }`}
                  >
                    {est}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Tienda / Vendedor</th>
                    <th className="p-4">Comprador</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-emerald-600">Comisión (4%)</th>
                    <th className="p-4">Estado Tienda</th>
                    <th className="p-4">Guía / Despacho</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4 text-right">Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pedidos
                    .filter((p) => {
                      const coincideEstado = filtroEstadoPedido === 'TODOS' || p.estado === filtroEstadoPedido
                      const q = busquedaPedido.toLowerCase().trim()
                      const tiendaStr = obtenerTiendaPedido(p).toLowerCase()
                      const coincideTexto =
                        !q ||
                        p.codigo?.toLowerCase().includes(q) ||
                        tiendaStr.includes(q) ||
                        p.comprador?.nombre?.toLowerCase().includes(q) ||
                        p.direccion?.ciudad?.toLowerCase().includes(q)
                      return coincideEstado && coincideTexto
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">{p.codigo}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Store size={14} className="text-violet-600 shrink-0" />
                            <span className="font-bold text-slate-900 bg-violet-50 text-violet-800 px-2.5 py-1 rounded-xl border border-violet-100 inline-block max-w-[180px] truncate" title={obtenerTiendaPedido(p)}>
                              {obtenerTiendaPedido(p)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{p.comprador?.nombre || 'Comprador'}</p>
                          <span className="text-[11px] text-slate-400">{p.direccion?.ciudad || 'Colombia'}</span>
                        </td>
                        <td className="p-4 font-black text-slate-900">{formatCurrency(p.total)}</td>
                        <td className="p-4 font-black text-emerald-600">
                          +{formatCurrency(p.total * 0.04)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.estado === 'ENTREGADO'
                              ? 'bg-emerald-50 text-emerald-700'
                              : p.estado === 'ENVIADO'
                              ? 'bg-sky-50 text-sky-700'
                              : p.estado === 'CANCELADO'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          {p.empresaEnvio ? (
                            <div>
                              <span className="font-semibold text-slate-700 block">{p.empresaEnvio}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{p.guiaSeguimiento || 'Sin guía'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Por despachar por tienda</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-400">
                          {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString('es-CO') : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setPedidoDetalleModal(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                            title="Auditar pedido de la tienda"
                          >
                            <Eye size={13} />
                            <span>Auditar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Tiendas & Vendedores */}
        {tab === 'vendedores' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <VendorsTable vendedores={vendedores} onActualizado={cargarDatos} />
          </div>
        )}

        {/* Tab: Categorías */}
        {tab === 'categorias' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <CategoryManager />
          </div>
        )}

        {/* Tab: Cupones */}
        {tab === 'cupones' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <CouponManager />
          </div>
        )}

        {/* Tab: Usuarios */}
        {tab === 'usuarios' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar usuario por nombre o correo..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['TODOS', 'COMPRADOR', 'VENDEDOR', 'ADMIN'].map((rol) => (
                  <button
                    key={rol}
                    onClick={() => setFiltroRolUsuario(rol)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      filtroRolUsuario === rol
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-violet-50 hover:text-violet-700'
                    }`}
                  >
                    {rol}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Fecha Registro</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
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
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 font-bold text-slate-900">{u.nombre}</td>
                        <td className="p-4 text-slate-600">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.rol === 'ADMIN' ? 'bg-rose-50 text-rose-600' : u.rol === 'VENDEDOR' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {u.activo ? 'Activo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CO') : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.rol !== 'ADMIN' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await adminService.cambiarEstadoUsuario(u.id, !u.activo)
                                    mostrarExito(u.activo ? `Usuario ${u.nombre} suspendido` : `Usuario ${u.nombre} reactivado`)
                                    cargarDatos()
                                  } catch {
                                    mostrarError('Error al modificar estado del usuario')
                                  }
                                }}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                                  u.activo ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
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
        )}

        {/* Tab: Finanzas & 4% */}
        {tab === 'finanzas' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg shadow-violet-500/15">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white font-bold text-xs border border-white/20">
                  <DollarSign size={14} />
                  <span>Control Financiero & Comisiones Mercatto</span>
                </span>
                <h3 className="text-2xl font-black">Comisión 4% del Administrador</h3>
                <p className="text-xs text-violet-100 max-w-xl leading-relaxed">
                  Mercatto retiene automáticamente el <strong>4%</strong> como ganancia de la plataforma y el <strong>96%</strong> se reserva para liquidar a las tiendas.
                </p>
              </div>

              <div className="bg-white/10 p-5 rounded-2xl border border-white/20 text-right shrink-0">
                <span className="text-xs font-bold text-violet-200 uppercase block">Ganancia Neta Admin (4%)</span>
                <span className="text-3xl font-black text-emerald-300">{formatCurrency(comisionesTotalesAdmin)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold">Ventas Brutas Marketplace</span>
                <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(totalVentasMercado)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs text-emerald-700 font-semibold">Tus Ganancias (4%)</span>
                <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(comisionesTotalesAdmin)}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-400 font-semibold">A Liquidar a Vendedores (96%)</span>
                <p className="text-xl font-black text-violet-700 mt-1">{formatCurrency(totalNetoProveedores)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Mensajes */}
        {tab === 'mensajes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-violet-500/15">
              <div>
                <h3 className="text-lg font-black">Centro de Supervisión de Mensajería</h3>
                <p className="text-xs text-violet-100 mt-1">Supervisa chats entre compradores y vendedores para asegurar transacciones seguras.</p>
              </div>
              <Link to="/mensajes" target="_blank" className="px-5 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs flex items-center gap-2 shadow-sm">
                <span>Abrir Chat Completo</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Tab: Soporte */}
        {tab === 'soporte' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <SupportTicketsManager />
          </div>
        )}

      </main>

      {/* Modal de Detalle de Auditoría de Pedido */}
      {pedidoDetalleModal && (
        <Modal
          isOpen={true}
          onClose={() => setPedidoDetalleModal(null)}
          title={`Auditoría de Pedido: ${pedidoDetalleModal.codigo}`}
        >
          <div className="space-y-4 text-xs">
            {/* Banner de Tienda Vendedora */}
            <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={16} className="text-violet-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-violet-600 font-bold uppercase block leading-none">Tienda Responsable</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block">{obtenerTiendaPedido(pedidoDetalleModal)}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-violet-700 border border-violet-200 shrink-0">
                Fulfillment por la tienda
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="font-bold text-slate-800">Datos de Entrega y Cliente:</p>
              <p className="text-slate-600">
                {pedidoDetalleModal.direccion?.nombreCompleto || pedidoDetalleModal.comprador?.nombre || 'Cliente'} — Tel: {pedidoDetalleModal.direccion?.telefono || 'N/A'}
              </p>
              <p className="text-slate-600">
                {pedidoDetalleModal.direccion?.direccion || 'Sin dirección física registrada'}, {pedidoDetalleModal.direccion?.ciudad || ''}
              </p>
              {pedidoDetalleModal.empresaEnvio ? (
                <p className="text-violet-700 font-semibold pt-1 border-t border-slate-200/60 mt-1">
                  Despachado por: {pedidoDetalleModal.empresaEnvio} • Guía de Seguimiento: {pedidoDetalleModal.guiaSeguimiento || 'N/A'}
                </p>
              ) : (
                <p className="text-slate-400 italic pt-1 border-t border-slate-200/60 mt-1">
                  Estado: Pendiente de empaque y despacho por parte de la tienda.
                </p>
              )}
            </div>

            {pedidoDetalleModal.items && pedidoDetalleModal.items.length > 0 && (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {pedidoDetalleModal.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{item.nombreProducto}</p>
                      {item.nombreVariante && <p className="text-[10px] text-slate-400">{item.nombreVariante}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-700">{item.cantidad} x {formatCurrency(item.precioUnitario)}</p>
                      <p className="font-bold text-violet-600">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen Financiero y Comisión Mercatto */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Comisión Mercatto Plataforma (4%):</span>
                <span className="font-bold text-emerald-600">+{formatCurrency(pedidoDetalleModal.total * 0.04)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Liquidación Neta para {obtenerTiendaPedido(pedidoDetalleModal)} (96%):</span>
                <span className="font-bold text-violet-700">{formatCurrency(pedidoDetalleModal.total * 0.96)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                <span>Total Facturado:</span>
                <span className="text-slate-900">{formatCurrency(pedidoDetalleModal.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default PanelAdmin
