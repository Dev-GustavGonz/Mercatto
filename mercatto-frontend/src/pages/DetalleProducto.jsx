import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import productoService from '../services/productoService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import ProductImages from '../components/product/ProductImages'
import ProductVariants from '../components/product/ProductVariants'
import PriceDisplay from '../components/product/PriceDisplay'
import StarRating from '../components/common/StarRating'
import ProductReviews from '../components/product/ProductReviews'
import ModalContactoVendedor from '../components/product/ModalContactoVendedor'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { ShoppingBag, Heart, MessageSquare, Store, ShieldCheck, Truck, RefreshCw, ChevronRight } from 'lucide-react'

export const DetalleProducto = () => {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [modalContacto, setModalContacto] = useState(false)
  const [esFavorito, setEsFavorito] = useState(false)

  const { agregarItem, setDrawerAbierto } = useCart()
  const { autenticado } = useAuth()
  const { success, info } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    productoService
      .obtenerPorId(id)
      .then((data) => {
        setProducto(data)
        if (data.variantes && data.variantes.length > 0) {
          setVarianteSeleccionada(data.variantes[0])
        }
      })
      .catch(() => navigate('/404'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading || !producto) {
    return <Spinner size="lg" className="py-32" />
  }

  const precioActual = varianteSeleccionada
    ? varianteSeleccionada.precio
    : producto.precio
  const precioOfertaActual = varianteSeleccionada
    ? varianteSeleccionada.precioOferta
    : producto.precioOferta
  const stockDisponible = varianteSeleccionada
    ? varianteSeleccionada.stock
    : producto.stock

  const handleAddToCart = () => {
    agregarItem(producto, varianteSeleccionada, cantidad)
  }

  const handleBuyNow = () => {
    agregarItem(producto, varianteSeleccionada, cantidad)
    navigate('/checkout')
  }

  const handleContactar = () => {
    if (!autenticado) {
      info('Inicia sesión para chatear con el proveedor')
      navigate('/login')
      return
    }
    navigate(`/mensajes?vendedorId=${producto.vendedor.usuario.id}&productoId=${producto.id}`)
  }

  const handleToggleFavorito = async () => {
    if (!autenticado) {
      info('Inicia sesión para guardar en favoritos')
      navigate('/login')
      return
    }
    try {
      const res = await productoService.toggleFavorito(producto.id)
      setEsFavorito(res.favorito)
      success(res.mensaje)
    } catch {}
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-200">Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/catalogo" className="hover:text-slate-600 dark:hover:text-slate-200">Catálogo</Link>
        {producto.categoria && (
          <>
            <ChevronRight size={12} />
            <Link to={`/catalogo?categoriaId=${producto.categoria.id}`} className="hover:text-slate-600 dark:hover:text-slate-200">
              {producto.categoria.nombre}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-xs">{producto.titulo}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <ProductImages imagenes={producto.imagenes} titulo={producto.titulo} />
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vendor Card */}
          {producto.vendedor && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  <Store size={18} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">Vendido y despachado por</p>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{producto.vendedor.nombreTienda}</h4>
                  <span className="text-[10px] text-slate-500">{producto.vendedor.ciudad || 'Colombia'} • {(producto.vendedor.calificacion || 5.0).toFixed(1)} ★</span>
                </div>
              </div>

              {/* Botón clave de contacto con el vendedor */}
              <button
                onClick={handleContactar}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Resolver dudas o coordinar con el proveedor"
              >
                <MessageSquare size={14} />
                <span>Contactar</span>
              </button>
            </div>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {producto.categoria?.nombre || 'General'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {producto.titulo}
            </h1>

            <div className="flex items-center gap-3 mt-2.5">
              <StarRating rating={producto.calificacion || 0} size={16} />
              <span className="text-xs text-slate-500">
                {producto.calificacion?.toFixed(1) || '0.0'} ({producto.totalResenas || 0} valoraciones)
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">{producto.totalVentas || 0} vendidos</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <PriceDisplay
              precio={precioActual}
              precioOferta={precioOfertaActual}
              size="lg"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {stockDisponible > 0 ? (
                <span className="text-emerald-600 font-semibold">Stock disponible ({stockDisponible} unidades)</span>
              ) : (
                <span className="text-rose-500 font-semibold">Agotado temporalmente</span>
              )}
            </p>
          </div>

          {/* Variants */}
          {producto.variantes && producto.variantes.length > 0 && (
            <ProductVariants
              variantes={producto.variantes}
              varianteSeleccionada={varianteSeleccionada}
              onSelectVariante={setVarianteSeleccionada}
            />
          )}

          {/* Quantity & Buy Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleToggleFavorito}
                className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:bg-slate-50 cursor-pointer"
                title="Añadir a lista de deseos"
              >
                <Heart size={20} className={esFavorito ? 'text-rose-500 fill-rose-500' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToCart}
                disabled={stockDisponible <= 0}
                className="w-full font-bold"
              >
                <ShoppingBag size={18} className="mr-2" />
                <span>Agregar al Carrito</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleBuyNow}
                disabled={stockDisponible <= 0}
                className="w-full font-bold"
              >
                Comprar Ahora
              </Button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>Garantía de compra protegida</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-indigo-500 shrink-0" />
              <span>Envío con número de guía</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Descripción del Producto</h3>
        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {producto.descripcion}
        </div>
      </section>

      {/* Reviews */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <ProductReviews
          productoId={producto.id}
          calificacionPromedio={producto.calificacion || 0}
          totalResenas={producto.totalResenas || 0}
        />
      </section>

      {/* Modal Contacto Vendedor */}
      {modalContacto && (
        <ModalContactoVendedor
          isOpen={true}
          producto={producto}
          onClose={() => setModalContacto(false)}
        />
      )}
    </div>
  )
}

export default DetalleProducto
