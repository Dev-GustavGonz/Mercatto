import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Laptop, 
  Smartphone, 
  Shirt, 
  Footprints, 
  Sparkles, 
  Home, 
  Wrench, 
  Activity, 
  Utensils,
  ArrowUpRight
} from 'lucide-react'

export const CategoriesShowcase = ({ categorias = [] }) => {
  const navigate = useNavigate()
  const [categoriaActiva, setCategoriaActiva] = useState(null)

  // Diccionario de apoyo visual para las categorías reales de la base de datos
  const visualMeta = useMemo(() => ({
    1: { icono: Laptop, imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80', badge: 'Flagship' },
    2: { icono: Shirt, imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80', badge: 'Tendencia' },
    3: { icono: Home, imagen: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=300&auto=format&fit=crop&q=80', badge: 'Confort' },
    4: { icono: Activity, imagen: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80', badge: 'Pro Fitness' },
    5: { icono: Sparkles, imagen: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80', badge: 'Cuidado' },
    6: { icono: Wrench, imagen: 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=300&auto=format&fit=crop&q=80', badge: 'Taller' },
    7: { icono: Smartphone, imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80', badge: 'Nuevos' },
    8: { icono: Laptop, imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80', badge: 'Gamers' },
    9: { icono: Footprints, imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80', badge: 'Popular' },
    10: { icono: Utensils, imagen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80', badge: 'Cocina' }
  }), [])

  // Lista de categorías dinámica alimentada por la BD con fallback limpio
  const listaCategorias = useMemo(() => {
    if (categorias && categorias.length > 0) {
      return categorias.map((cat) => {
        const meta = visualMeta[cat.id] || { icono: Sparkles, imagen: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80', badge: 'Oficial' }
        return {
          id: cat.id,
          nombre: cat.nombre,
          imagen: cat.imagenUrl || meta.imagen,
          icono: meta.icono,
          badge: meta.badge
        }
      })
    }

    return [
      { id: 1, nombre: 'Tecnología y Electrónica', imagen: visualMeta[1].imagen, icono: Laptop, badge: 'Flagship' },
      { id: 2, nombre: 'Moda y Ropa', imagen: visualMeta[2].imagen, icono: Shirt, badge: 'Tendencia' },
      { id: 3, nombre: 'Hogar y Muebles', imagen: visualMeta[3].imagen, icono: Home, badge: 'Confort' },
      { id: 4, nombre: 'Deportes y Fitness', imagen: visualMeta[4].imagen, icono: Activity, badge: 'Pro Fitness' },
      { id: 5, nombre: 'Belleza y Cuidado', imagen: visualMeta[5].imagen, icono: Sparkles, badge: 'Cuidado' },
      { id: 6, nombre: 'Herramientas', imagen: visualMeta[6].imagen, icono: Wrench, badge: 'Taller' }
    ]
  }, [categorias, visualMeta])

  const handleSelect = (cat) => {
    setCategoriaActiva(cat.id)
    navigate(`/catalogo?categoriaId=${cat.id}`)
  }

  return (
    <section className="space-y-6">
      
      {/* Encabezado de la Sección con Tipografía de Alto Impacto */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
            EXPLORA POR <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-emerald-500">CATEGORÍAS</span>
          </h2>
        </div>

        <button
          onClick={() => navigate('/catalogo')}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-violet-600 transition cursor-pointer shadow-xs"
        >
          <span>Ver Todo el Catálogo</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Cuadrícula de Tarjetas Flotantes rounded-3xl (100% conectadas a la BD) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {listaCategorias.map((cat) => {
          const Icon = cat.icono || Sparkles
          const esActivo = categoriaActiva === cat.id

          return (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className={`group relative rounded-3xl p-4 bg-white dark:bg-slate-900 border transition-all duration-300 flex flex-col items-center justify-between min-h-[185px] cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${
                esActivo 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/20' 
                  : 'border-slate-200/90 dark:border-slate-800 hover:border-violet-500/70'
              }`}
            >
              {/* Badge superior */}
              <div className="w-full flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-violet-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon size={12} />
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.badge}
                </span>
              </div>

              {/* Imagen Aislada de Producto de la Categoría */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center p-1">
                <img
                  src={cat.imagen}
                  alt={cat.nombre}
                  className="max-h-full max-w-full object-contain rounded-2xl drop-shadow-[0_10px_14px_rgba(0,0,0,0.14)] group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Nombre de la Categoría */}
              <div className="w-full text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className={`text-xs sm:text-sm font-extrabold transition-colors block truncate ${
                  esActivo 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400'
                }`}>
                  {cat.nombre}
                </span>
              </div>
            </div>
          )
        })}
      </div>

    </section>
  )
}

export default CategoriesShowcase
