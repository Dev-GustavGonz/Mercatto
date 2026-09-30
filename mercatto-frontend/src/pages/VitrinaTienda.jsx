import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import tiendaService from '../services/tiendaService'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import ProductGrid from '../components/product/ProductGrid'
import Spinner from '../components/common/Spinner'
import { getMediaUrl } from '../utils/constants'
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  Package,
  Tag,
  Search,
  MessageSquare,
  Share2,
  ArrowLeft,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react'

export const VitrinaTienda = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { autenticado } = useAuth()
  const { info, success } = useToast()

  const [tienda, setTienda] = useState(null)
  const [productos, setProductos] = useState([])
  const [cargandoTienda, setCargandoTienda] = useState(true)
  const [cargandoProductos, setCargandoProductos] = useState(true)

  // Filtros
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [orden, setOrden] = useState('recientes')
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [totalElementos, setTotalElementos] = useState(0)
  const [copiado, setCopiado] = useState(false)

  // Cargar datos de la tienda
  useEffect(() => {
    cargarTienda()
  }, [id])

  // Cargar productos de la tienda cuando cambian los filtros
  useEffect(() => {
    if (tienda?.id) {
      cargarProductos()
    }
  }, [id, marcaSeleccionada, busqueda, orden, pagina, tienda?.id])

  const cargarTienda = async () => {
    try {
      setCargandoTienda(true)
      const data = await tiendaService.obtenerTienda(id)
      setTienda(data)
    } catch (err) {
      console.error('Error al cargar vitrina:', err)
      setTienda(null)
    } finally {
      setCargandoTienda(false)
    }
  }

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true)
      const params = {
        pagina,
        tamano: 12,
        orden,
      }
      if (marcaSeleccionada) params.marca = marcaSeleccionada
      if (busqueda.trim()) params.q = busqueda.trim()

      const data = await tiendaService.obtenerProductosTienda(id, params)
      setProductos(data.content || [])
      setTotalPaginas(data.totalPages || 0)
      setTotalElementos(data.totalElements || 0)
    } catch (err) {
      console.error('Error al cargar productos de la tienda:', err)
      setProductos([])
    } finally {
      setCargandoProductos(false)
    }
  }

  const handleBuscar = (e) => {
    e.preventDefault()
    setBusqueda(busquedaInput)
    setPagina(0)
  }

  const handleLimpiarFiltros = () => {
    setMarcaSeleccionada('')
    setBusqueda('')
    setBusquedaInput('')
    setOrden('recientes')
    setPagina(0)
  }

  const handleContactar = () => {
    if (!autenticado) {
      info('Inicia sesión para conversar con la tienda')
      navigate('/login')
      return
    }
    if (tienda?.usuarioId) {
      navigate(`/mensajes?vendedorId=${tienda.usuarioId}&asunto=Consulta sobre vitrina ${tienda.nombreTienda}`)
    }
  }

  const handleCompartir = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiado(true)
    success('Enlace de la tienda copiado al portapapeles')
    setTimeout(() => setCopiado(false), 3000)
  }

  if (cargandoTienda) {
    return <Spinner size="lg" className="py-32" />
  }

  if (!tienda) {
    return (
      <div className="py-20 text-center space-y-4">
        <Store size={48} className="mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800">Tienda no encontrada</h2>
        <p className="text-slate-500 text-sm">La tienda que estás buscando no existe o no se encuentra activa.</p>
        <Link
          to="/tiendas"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow hover:bg-indigo-700 transition"
        >
          <ArrowLeft size={16} />
          <span>Volver al Directorio de Tiendas</span>
        </Link>
      </div>
    )
  }

  const logoDefault = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80'

  const detectarPortadaVitrina = () => {
    if (tienda.portadaUrl) return tienda.portadaUrl
    const txt = `${tienda.nombreTienda} ${tienda.descripcion} ${tienda.marcas?.join(' ')}`.toLowerCase()
    if (txt.includes('gadget') || txt.includes('tecno') || txt.includes('celular') || txt.includes('apple') || txt.includes('sony') || txt.includes('nintendo')) {
      return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1400&auto=format&fit=crop&q=80'
    }
    if (txt.includes('zapato') || txt.includes('calzado') || txt.includes('nike') || txt.includes('adidas') || txt.includes('puma') || txt.includes('sneaker')) {
      return 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&auto=format&fit=crop&q=80'
    }
    if (txt.includes('app') || txt.includes('software') || txt.includes('licencia') || txt.includes('adobe') || txt.includes('microsoft') || txt.includes('digital')) {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80'
    }
    if (txt.includes('ropa') || txt.includes('moda') || txt.includes('boutique') || txt.includes('vestir')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80'
    }
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&auto=format&fit=crop&q=80'
  }

  const portadaElegida = detectarPortadaVitrina()

  return (
    <div className="space-y-8 pb-20">
      {/* Navegación Breadcrumb / Regreso */}
      <div className="flex items-center justify-between">
        <Link
          to="/tiendas"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft size={14} />
          <span>Volver a Tiendas Oficiales</span>
        </Link>
      </div>

      {/* Header Vitrina Oficial */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Banner Superior */}
        <div className="relative h-48 sm:h-72 bg-slate-950 overflow-hidden">
          <img
            src={getMediaUrl(portadaElegida, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&auto=format&fit=crop&q=80')}
            alt={tienda.nombreTienda}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/30" />

          {/* Badges en la portada */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold backdrop-blur-md">
              <ShieldCheck size={14} />
              <span>Verificado Mercatto</span>
            </span>

            {tienda.tipoSuscripcion && tienda.tipoSuscripcion !== 'STARTER' && (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow">
                {tienda.tipoSuscripcion}
              </span>
            )}
          </div>
        </div>

        {/* Info y Acciones de la Tienda */}
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
            {/* Logo y Nombre */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="-mt-14 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-slate-800 p-1.5 shadow-xl border-4 border-white dark:border-slate-900 overflow-hidden shrink-0 z-10">
                <img
                  src={getMediaUrl(tienda.logoUrl, logoDefault)}
                  alt={tienda.nombreTienda}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="space-y-1.5 pt-2 sm:pt-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {tienda.nombreTienda}
                  </h1>
                  <CheckCircle2 size={22} className="text-indigo-600 fill-indigo-100 shrink-0" title="Distribuidor Autorizado" />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <MapPin size={13} className="text-indigo-500" />
                    {tienda.ciudad || 'Colombia'}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-amber-200/50">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(tienda.calificacion || 5.0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-400">({tienda.totalVentas || 0} ventas)</span>
                  </div>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {tienda.totalProductos || 0} productos activos
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
              <button
                onClick={handleCompartir}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Copiar enlace de la tienda"
              >
                {copiado ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
                <span>{copiado ? '¡Copiado!' : 'Compartir'}</span>
              </button>

              <button
                onClick={handleContactar}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer hover:scale-105"
              >
                <MessageSquare size={16} />
                <span>Chatear con la Tienda</span>
              </button>
            </div>
          </div>

          {/* Descripción */}
          {tienda.descripcion && (
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              {tienda.descripcion}
            </p>
          )}

          {/* Marcas Oficiales de esta Tienda */}
          {tienda.marcas && tienda.marcas.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Marcas que comercializa esta tienda ({tienda.marcas.length})
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => { setMarcaSeleccionada(''); setPagina(0) }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    !marcaSeleccionada
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Todos los productos
                </button>

                {tienda.marcas.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMarcaSeleccionada(marcaSeleccionada === m ? '' : m); setPagina(0) }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      marcaSeleccionada === m
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Filtros & Búsqueda dentro de la vitrina */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Formulario de búsqueda interno */}
        <form onSubmit={handleBuscar} className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar en el catálogo de ${tienda.nombreTienda}...`}
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 transition"
          >
            Buscar
          </button>
        </form>

        {/* Ordenamiento y estado de filtros */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {(marcaSeleccionada || busqueda) && (
            <button
              onClick={handleLimpiarFiltros}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 underline cursor-pointer"
            >
              Restablecer
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => { setOrden(e.target.value); setPagina(0) }}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="ventas">Más vendidos</option>
              <option value="calificacion">Mejor calificados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Encabezado del catálogo de la tienda */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Catálogo Exclusivo</span>
          <span className="text-xs font-semibold text-slate-400">({totalElementos} artículos encontrados)</span>
        </h2>

        {marcaSeleccionada && (
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-100">
            Filtrando por marca: {marcaSeleccionada}
          </span>
        )}
      </div>

      {/* Grid de Productos */}
      <ProductGrid
        productos={productos}
        loading={cargandoProductos}
        emptyTitle="Esta tienda no tiene productos con los criterios actuales"
        emptyDescription="Intenta limpiar el filtro de marca o realizar otra búsqueda en el catálogo."
      />

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={pagina === 0}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-3">
            Página {pagina + 1} de {totalPaginas}
          </span>

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={pagina >= totalPaginas - 1}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default VitrinaTienda
