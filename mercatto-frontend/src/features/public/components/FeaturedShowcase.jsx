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
  Store,
  ShieldCheck
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
      p?.imagenUrl ||
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80'
    )
  }

  return (
    <section className="space-y-6">
      
      {/* Encabezado con Tipografía de Alto Impacto */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            PRODUCTOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-violet-600">DESTACADOS PRO</span>
          </h2>
        </div>
      </div>

      {/* Grid: 1 Banner Promocional Lateral con Overlay Oscuro + 4 Tarjetas de Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* ============================================================== */}
        {/* BANNER PROMOCIONAL LATERAL IZQUIERDO (ESTILO PRO TRANSLÚCIDO)  */}
        {/* ============================================================== */}
        <div 
          onClick={() => navigate('/catalogo?enOferta=true')}
          className="relative rounded-3xl overflow-hidden min-h-[380px] lg:min-h-full flex flex-col justify-between p-7 text-white shadow-2xl border border-emerald-500/25 cursor-pointer group bg-[#04120e]"
        >
          {/* Imagen de fondo con textura inferior y overlay oscuro */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030907] via-[#041812]/80 to-[#0f172a]/50" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest uppercase text-emerald-300 bg-emerald-950/85 px-3 py-1 rounded-full border border-emerald-400/35 backdrop-blur-md">
              <span>ESPECIAL RENDIMIENTO</span>
            </span>
          </div>

          <div className="relative z-10 space-y-3 pt-12">
            <h3 className="text-3xl font-extrabold text-white leading-tight uppercase tracking-tight">
              HASTA <span className="text-emerald-400">45% OFF</span> EN LÍNEA PRO
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Equipamiento deportivo, tecnología y moda con garantía oficial y pago protegido por Wompi.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(52,211,153,0.4)] group-hover:scale-105 transition-all">
                <span>Comprar Ahora</span>
                <ArrowRight size={14} className="stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4 TARJETAS DE PRODUCTOS (ROUNDED-3XL CON ALTO CONTRASTE)       */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {items.map((prod, index) => {
            const isFav = favoriteIds.includes(prod.id)
            const esHovered = hoveredCard === prod.id
            const precioActual = prod.precioOferta || prod.precio || 0
            const tieneOferta = prod.precioOferta && prod.precioOferta < prod.precio

            return (
              <div
                key={prod.id || index}
                onMouseEnter={() => setHoveredCard(prod.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col justify-between p-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${
                  esHovered
                    ? 'border-violet-500 ring-2 ring-violet-500/20'
                    : 'border-slate-200/90 dark:border-slate-800'
                }`}
              >
                {/* Botón flotante superior: Favoritos & Vista */}
                <div className="w-full flex items-center justify-between pb-2">
                  {tieneOferta ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                      OFERTA PRO
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                      {prod.marca || 'OFICIAL'}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
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
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    <button
                      onClick={() => navigate(`/producto/${prod.id}`)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Ver producto completo"
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>

                {/* Imagen del Producto */}
                <div 
                  onClick={() => navigate(`/producto/${prod.id}`)}
                  className="relative w-full h-44 sm:h-48 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-center p-3 cursor-pointer select-none overflow-hidden"
                >
                  <img
                    src={getImgUrl(prod)}
                    alt={prod.titulo}
                    className="max-h-full max-w-full object-contain drop-shadow-[0_12px_15px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Detalles y Precio */}
                <div className="pt-3.5 space-y-2">
                  {/* Tienda vendedora */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1.5 truncate">
                      <Store size={12} className="text-violet-500 shrink-0" />
                      <span className="truncate">{prod.vendedor?.nombreTienda || 'Tienda Oficial'}</span>
                    </span>
                    <ShieldCheck size={13} className="text-emerald-500 shrink-0" title="Garantía verificada" />
                  </div>

                  {/* Título */}
                  <h4 
                    onClick={() => navigate(`/producto/${prod.id}`)}
                    className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors cursor-pointer"
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
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        agregarItem(prod)
                      }}
                      className={`px-3.5 h-9 rounded-full flex items-center gap-1.5 text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
                        esHovered 
                          ? 'bg-emerald-400 text-slate-950 shadow-emerald-400/30 scale-105' 
                          : 'bg-violet-600 text-white hover:bg-emerald-400 hover:text-slate-950'
                      }`}
                      title="Agregar al carrito"
                    >
                      <ShoppingBag size={14} />
                      <span>Añadir</span>
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
