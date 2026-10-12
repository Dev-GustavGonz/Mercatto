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
  Sparkles, 
  Check, 
  Store 
} from 'lucide-react'

export const FeaturedShowcase = ({ productos = [] }) => {
  const navigate = useNavigate()
  const { agregarItem } = useCart()
  const { favoriteIds, toggleFavoriteId } = useFavorites()
  const [hoveredCard, setHoveredCard] = useState(null)

  // Tomamos los 4 productos destacados principales
  const items = productos.slice(0, 4)

  const getImgUrl = (p) => {
    return (
      p?.imagenes?.find(i => i.principal)?.url ||
      p?.imagenes?.[0]?.url ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'
    )
  }

  return (
    <section className="space-y-6">
      
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black tracking-widest uppercase text-violet-600 dark:text-violet-400">
          Catálogo Oficial
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Nuestros Productos Destacados
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
          Selección premium con garantía oficial, stock garantizado y despacho inmediato.
        </p>
      </div>

      {/* Grid: 1 Banner Promocional Lateral + 4 Tarjetas de Productos (Idéntico a Foto 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* ============================================================== */}
        {/* BANNER PROMOCIONAL LATERAL IZQUIERDO (1 COLUMNA)               */}
        {/* ============================================================== */}
        <div 
          onClick={() => navigate('/catalogo?enOferta=true')}
          className="relative rounded-3xl overflow-hidden min-h-[360px] lg:min-h-full flex flex-col justify-end p-7 text-white shadow-xl cursor-pointer group"
          style={{
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.2) 100%), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 space-y-3">
            <span className="inline-block text-[11px] font-black tracking-widest uppercase text-violet-300 bg-violet-950/80 px-3 py-1 rounded-full border border-violet-700/50">
              Descuentos 2026
            </span>
            <h3 className="text-3xl font-black text-white leading-tight">
              Hasta 45% OFF
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Aprovecha promociones exclusivas en artículos seleccionados.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-slate-950 font-extrabold text-xs shadow-lg group-hover:scale-105 transition-transform">
                <span>Comprar Ahora</span>
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4 TARJETAS DE PRODUCTOS (4 COLUMNAS)                           */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {items.map((prod, index) => {
            const isFav = favoriteIds.includes(prod.id)
            const esHovered = hoveredCard === prod.id
            const precioActual = prod.precioOferta || prod.precio || 0
            const tieneOferta = prod.precioOferta && prod.precioOferta < prod.precio
            const rating = prod.calificacion || 5.0

            return (
              <div
                key={prod.id || index}
                onMouseEnter={() => setHoveredCard(prod.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                  esHovered
                    ? 'border-violet-500 ring-2 ring-violet-500/25'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                {/* Botón flotante superior: Favoritos & Vista */}
                <div className="w-full flex items-center justify-between pb-2">
                  {tieneOferta ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                      OFERTA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                      {prod.marca || 'ORIGINAL'}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* Botón Favorito */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavoriteId(prod.id)
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isFav 
                          ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/60' 
                          : 'bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:bg-slate-800'
                      }`}
                      title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                      <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    {/* Botón Vista Rápida */}
                    <button
                      onClick={() => navigate(`/producto/${prod.id}`)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Ver producto completo"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Imagen del Producto */}
                <div 
                  onClick={() => navigate(`/producto/${prod.id}`)}
                  className="relative w-full h-44 sm:h-48 flex items-center justify-center p-2 cursor-pointer select-none"
                >
                  <img
                    src={getImgUrl(prod)}
                    alt={prod.titulo}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.12)] group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Detalles y Precio */}
                <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Tienda vendedora */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold truncate">
                    <Store size={12} className="text-violet-500 shrink-0" />
                    <span className="truncate">{prod.vendedor?.nombreTienda || 'Tienda Oficial'}</span>
                  </div>

                  {/* Título */}
                  <h4 
                    onClick={() => navigate(`/producto/${prod.id}`)}
                    className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors cursor-pointer"
                  >
                    {prod.titulo}
                  </h4>

                  {/* Precios */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(precioActual)}
                    </span>
                    {tieneOferta && (
                      <span className="text-xs line-through text-slate-400 font-medium">
                        {formatCurrency(prod.precio)}
                      </span>
                    )}
                  </div>

                  {/* Estrellas de Calificación & Botón Carrito */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>

                    {/* Botón Acción Carrito (Verde en la referencia, Violeta en Mercatto) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        agregarItem(prod)
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                        esHovered 
                          ? 'bg-violet-600 text-white shadow-violet-600/30 scale-105' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-600 hover:text-white'
                      }`}
                      title="Agregar al carrito"
                    >
                      <ShoppingBag size={17} />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>

    </section>
  )
}

export default FeaturedShowcase
