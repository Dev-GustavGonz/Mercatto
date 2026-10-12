import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productoService, ModalContactoVendedor } from '@/features/productos'
import { tiendaService } from '@/features/tiendas/services/tiendaService'
import { useCart } from '@/hooks/useCart'
import { useFavorites } from '@/hooks/useFavorites'
import { formatCurrency } from '@/utils/formatCurrency'

// Componentes del nuevo diseño panorámico y dinámico
import HeroExplodedTower from '../components/HeroExplodedTower'
import PromotionalBento from '../components/PromotionalBento'
import CategoriesShowcase from '../components/CategoriesShowcase'
import FeaturedShowcase from '../components/FeaturedShowcase'
import ProductTripleColumn from '../components/ProductTripleColumn'

import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  BadgeCheck, 
  Store, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react'

export const Home = () => {
  const [destacados, setDestacados] = useState([])
  const [nuevos, setNuevos] = useState([])
  const [tiendas, setTiendas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [productoContacto, setProductoContacto] = useState(null)

  const { agregarItem } = useCart()
  const { toggleFavoriteId, favoriteIds } = useFavorites()
  const navigate = useNavigate()
  const tiendasScrollRef = useRef(null)

  // Portadas por defecto para las tiendas oficiales
  const coverDefaults = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=600&auto=format&fit=crop&q=80'
  ]

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dest, nuev, tiendasData, catsData] = await Promise.all([
          productoService.obtenerDestacados().catch(() => []),
          productoService.obtenerNuevos().catch(() => []),
          tiendaService.listarTiendas().catch(() => []),
          productoService.listarCategorias().catch(() => [])
        ])
        setDestacados(dest || [])
        setNuevos(nuev || [])
        setTiendas(tiendasData || [])
        setCategorias(catsData || [])
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  // Desplazamiento horizontal para el carrusel de tiendas oficiales
  const scrollTiendas = (direccion) => {
    if (tiendasScrollRef.current) {
      const offset = direccion === 'left' ? -320 : 320
      tiendasScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  // Producto bandera para el Hero 3D de la Torre PC
  const productoTorre = destacados[0] || null

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 pb-20 font-sans">
      <div className="max-w-[1520px] mx-auto px-2 sm:px-4 lg:px-6 pt-1 sm:pt-2 space-y-10 sm:space-y-14">

        {/* ========================================================= */}
        {/* 1. SECCIÓN PRINCIPAL: ESCAPARATE DINÁMICO MULTICATEGORÍA  */}
        {/* ========================================================= */}
        <section>
          <HeroExplodedTower 
            categorias={categorias}
            productos={destacados}
            onAddToCart={agregarItem} 
          />
        </section>

        {/* ========================================================= */}
        {/* 2. TRÍO DE BANNERS PROMOCIONALES DINÁMICOS (FOTO 1 ARRIBA) */}
        {/* ========================================================= */}
        <section>
          <PromotionalBento 
            productos={destacados} 
            onAddToCart={agregarItem} 
          />
        </section>

        {/* ========================================================= */}
        {/* 3. EXPLORAR POR CATEGORÍAS DESTACADAS (FOTO 1 ABAJO)      */}
        {/* ========================================================= */}
        <section>
          <CategoriesShowcase categorias={categorias} />
        </section>

        {/* ========================================================= */}
        {/* 4. NUESTROS PRODUCTOS DESTACADOS (FOTO 2 ARRIBA)          */}
        {/* ========================================================= */}
        <section>
          <FeaturedShowcase productos={destacados} />
        </section>

        {/* ========================================================= */}
        {/* 5. TRIPLE COLUMNA + BANNER VERTICAL ALTO (FOTO 2 ABAJO)   */}
        {/* ========================================================= */}
        <section>
          <ProductTripleColumn 
            destacados={destacados} 
            nuevos={nuevos} 
          />
        </section>

        {/* ========================================================= */}
        {/* 6. SECCIÓN TIENDAS OFICIALES VERIFICADAS EN COLOMBIA      */}
        {/* ========================================================= */}
        {tiendas.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Tiendas Oficiales
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Marcas verificadas y distribuidores oficiales en Colombia
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTiendas('left')}
                  className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 text-slate-600 dark:text-slate-300 hover:text-violet-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollTiendas('right')}
                  className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-300 text-slate-600 dark:text-slate-300 hover:text-violet-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Carrusel horizontal de tiendas */}
            <div
              ref={tiendasScrollRef}
              className="flex gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none -mr-4 sm:-mr-6 lg:-mr-8 pr-12 sm:pr-16"
            >
              {tiendas.map((t, idx) => {
                const coverImg = t.bannerUrl || coverDefaults[idx % coverDefaults.length]
                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/tienda/${t.id}`)}
                    className="w-64 sm:w-72 shrink-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group select-none"
                  >
                    <div className="h-24 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={coverImg}
                        alt={t.nombreTienda}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
                      <div className="flex items-end justify-between -mt-7 mb-2">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-3 border-white dark:border-slate-900 shadow-md overflow-hidden bg-slate-900 shrink-0">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt={t.nombreTienda} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-white text-sm bg-gradient-to-br from-violet-600 to-indigo-800">
                                {t.nombreTienda?.charAt(0) || 'T'}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                            <CheckCircle2 size={12} className="fill-blue-500 text-white" />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tienda/${t.id}`)
                          }}
                          className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 font-extrabold text-xs transition cursor-pointer"
                        >
                          Ver Tienda
                        </button>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                            {t.nombreTienda}
                          </h3>
                          <BadgeCheck size={14} className="text-blue-500 shrink-0 fill-blue-500 text-white" />
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {t.ciudad || 'Colombia'} • Tienda Oficial
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 7. FRANJA DE GARANTÍAS Y CONFIANZA DEL MARKETPLACE        */}
        {/* ========================================================= */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Envío a toda Colombia</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Rápido y con seguimiento</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Pago Seguro con Wompi</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bancolombia, PSE y Nequi</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BadgeCheck size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Tiendas Verificadas</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vendedores certificados</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Compra Protegida</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Garantía en cada pedido</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Modal Contacto Vendedor */}
      {productoContacto && (
        <ModalContactoVendedor
          isOpen={true}
          producto={productoContacto}
          onClose={() => setProductoContacto(null)}
        />
      )}
    </div>
  )
}

export default Home
