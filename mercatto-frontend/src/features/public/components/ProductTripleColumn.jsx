import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatCurrency'
import { useCart } from '@/hooks/useCart'
import { useFavorites } from '@/hooks/useFavorites'
import { 
  ShoppingBag, 
  Heart, 
  Eye, 
  Star, 
  ArrowRight, 
  Flame, 
  Award, 
  TrendingUp
} from 'lucide-react'

export const ProductTripleColumn = ({ destacados = [], nuevos = [] }) => {
  const navigate = useNavigate()
  const { agregarItem } = useCart()
  const { favoriteIds, toggleFavoriteId } = useFavorites()
  const [hoveredItemId, setHoveredItemId] = useState(null)

  // Separación dinámica en 3 listas
  const ofertasReales = destacados.filter(p => p.precioOferta && p.precioOferta < p.precio)
  const hotDeals = (ofertasReales.length >= 3 ? ofertasReales : destacados).slice(0, 3)
  const bestSellers = (nuevos.length >= 3 ? nuevos : destacados.slice(2, 5)).slice(0, 3)
  const topRated = [...destacados]
    .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
    .slice(0, 3)

  const getImgUrl = (p) => {
    return (
      p?.imagenes?.find(i => i.principal)?.url ||
      p?.imagenes?.[0]?.url ||
      p?.imagenUrl ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80'
    )
  }

  // Renderizador de cada fila compacta de producto
  const renderItemCard = (prod) => {
    const isFav = favoriteIds.includes(prod.id)
    const esHover = hoveredItemId === prod.id
    const precio = prod.precioOferta || prod.precio || 0

    return (
      <div
        key={prod.id}
        onMouseEnter={() => setHoveredItemId(prod.id)}
        onMouseLeave={() => setHoveredItemId(null)}
        onClick={() => navigate(`/producto/${prod.id}`)}
        className={`group relative rounded-3xl p-3.5 bg-white dark:bg-slate-900 border transition-all duration-300 flex items-center gap-3.5 cursor-pointer ${
          esHover
            ? 'border-violet-500 shadow-lg ring-1 ring-violet-500/20 -translate-y-0.5'
            : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
        }`}
      >
        {/* Imagen del Producto en Miniatura */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={getImgUrl(prod)}
            alt={prod.titulo}
            className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Información y Acciones Rápidas */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {prod.titulo}
          </h4>

          {/* Precios */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {formatCurrency(precio)}
            </span>
            {prod.precioOferta && prod.precioOferta < prod.precio && (
              <span className="text-[10px] line-through text-slate-400">
                {formatCurrency(prod.precio)}
              </span>
            )}
          </div>

          {/* Estrellas */}
          <div className="flex items-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} fill="currentColor" />
            ))}
            <span className="text-[10px] text-slate-400 font-semibold ml-1">
              ({prod.calificacion || 4.9})
            </span>
          </div>

          {/* Botones de acción flotantes al pasar el mouse */}
          {esHover && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-2 pt-1 animate-fadeIn"
            >
              <button
                onClick={() => agregarItem(prod)}
                className="p-1.5 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-xs transition-colors cursor-pointer"
                title="Agregar al carrito"
              >
                <ShoppingBag size={14} />
              </button>
              <button
                onClick={() => toggleFavoriteId(prod.id)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  isFav ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500'
                }`}
                title="Favorito"
              >
                <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => navigate(`/producto/${prod.id}`)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                title="Ver detalle"
              >
                <Eye size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
      
      {/* ============================================================== */}
      {/* COLUMNA 1: HOT DEALS (OFERTAS MÁS VISTAS)                      */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Flame size={17} />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
            OFERTAS <span className="text-emerald-600 dark:text-emerald-400">DEL MOMENTO</span>
          </h3>
        </div>
        <div className="space-y-3">
          {hotDeals.map(renderItemCard)}
        </div>
      </div>

      {/* ============================================================== */}
      {/* COLUMNA 2: BEST SELLER (MÁS VENDIDOS)                          */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
            <TrendingUp size={17} />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
            MÁS <span className="text-violet-600 dark:text-violet-400">VENDIDOS</span>
          </h3>
        </div>
        <div className="space-y-3">
          {bestSellers.map(renderItemCard)}
        </div>
      </div>

      {/* ============================================================== */}
      {/* COLUMNA 3: TOP RATED (MEJOR CALIFICADOS)                       */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
            <Award size={17} />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight">
            MEJOR <span className="text-amber-500">CALIFICADOS</span>
          </h3>
        </div>
        <div className="space-y-3">
          {topRated.map(renderItemCard)}
        </div>
      </div>

      {/* ============================================================== */}
      {/* COLUMNA 4: BANNER VERTICAL DERECHO CON OVERLAY OSCURO PRO      */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate('/catalogo')}
        className="relative rounded-3xl overflow-hidden min-h-[340px] flex flex-col justify-between p-7 text-white shadow-2xl border border-violet-500/25 cursor-pointer group bg-[#0b0914]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 transition-transform duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#130f26]/80 to-[#042f2e]/40" />

        <div className="relative z-10">
          <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-violet-300 bg-violet-950/85 px-3 py-1 rounded-full border border-violet-400/35 backdrop-blur-md">
            BENEFICIO EXCLUSIVO
          </span>
        </div>

        <div className="relative z-10 space-y-3 pt-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight">
            AHORRA <span className="text-emerald-400">35%</span> EN TU PEDIDO
          </h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Paga seguro con Wompi, PSE, Nequi o tarjetas. Cobertura de envíos a toda Colombia.
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(52,211,153,0.4)] group-hover:scale-105 transition-all">
              <span>Explorar Ahora</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </span>
          </div>
        </div>
      </div>

    </section>
  )
}

export default ProductTripleColumn
