import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { productoService, ModalContactoVendedor } from '@/features/productos'
import { tiendaService } from '@/features/tiendas/services/tiendaService'
import { useCart } from '@/hooks/useCart'
import { useFavorites } from '@/hooks/useFavorites'

// Componentes del diseño Showcase 2026
import HeroExplodedTower from '../components/HeroExplodedTower'
import PromotionalBento from '../components/PromotionalBento'
import CategoriesShowcase from '../components/CategoriesShowcase'
import FeaturedShowcase from '../components/FeaturedShowcase'
import ProductTripleColumn from '../components/ProductTripleColumn'

import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  BadgeCheck, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  CheckCircle2,
  Sparkles
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

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50/80 dark:bg-slate-950 pb-20 font-sans">
      {/* ========================================================= */}
      {/* 1. HERO SHOWCASE FULL-WIDTH (100% ANCHO DE PANTALLA REAL) */}
      {/* ========================================================= */}
      <section className="w-full">
        <HeroExplodedTower 
          categorias={categorias}
          productos={destacados}
          onAddToCart={agregarItem} 
        />
      </section>

      <div className="container max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-10 sm:space-y-14">

        {/* ========================================================= */}
        {/* 2. BARRA FLOTANTE DELGADA DE CONFIANZA (TEMPRANA / ARRIBA)*/}
        {/* ========================================================= */}
        <section aria-label="Garantías y respaldo oficial de Mercatto">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl px-5 py-3.5 sm:px-7 sm:py-4 shadow-md shadow-slate-200/60 dark:shadow-black/40 border border-slate-200/90 dark:border-slate-800">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CreditCard size={19} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    Envíos & Pago Wompi
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    PSE, Nequi, Bancolombia y Tarjetas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={19} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    Compra 100% Protegida
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Tu dinero seguro en cada pedido
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BadgeCheck size={19} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    Garantía Oficial
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Tiendas y marcas verificadas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/25 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                  <Truck size={19} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    Envío a Toda Colombia
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Despacho rápido con rastreo
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. SECCIÓN DE OFERTAS CON URGENCIA (JUSTO DEBAJO DEL HERO)*/}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div className="space-y-1">
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                OFERTAS DEL MES & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-violet-600">DESTACADOS PRO</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Precios especiales directos de proveedores verificados en Colombia
            </p>
          </div>

          <PromotionalBento 
            productos={destacados} 
            onAddToCart={agregarItem} 
          />
        </section>

        {/* ========================================================= */}
        {/* 4. TARJETAS DE CATEGORÍAS OFICIALES DESTACADAS            */}
        {/* ========================================================= */}
        <section>
          <CategoriesShowcase categorias={categorias} />
        </section>

        {/* ========================================================= */}
        {/* 5. NUESTROS PRODUCTOS DESTACADOS PRO                      */}
        {/* ========================================================= */}
        <section>
          <FeaturedShowcase productos={destacados} />
        </section>

        {/* ========================================================= */}
        {/* 6. TRIPLE COLUMNA + BANNER VERTICAL CON OVERLAY OSCURO    */}
        {/* ========================================================= */}
        <section>
          <ProductTripleColumn 
            destacados={destacados} 
            nuevos={nuevos} 
          />
        </section>

        {/* ========================================================= */}
        {/* 7. SECCIÓN TIENDAS OFICIALES VERIFICADAS EN COLOMBIA      */}
        {/* ========================================================= */}
        {tiendas.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-[11px] font-extrabold tracking-widest uppercase text-violet-700 dark:text-violet-300">
                  <Sparkles size={12} />
                  <span>Proveedores Certificados</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
                  TIENDAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-emerald-500">OFICIALES</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Marcas verificadas y distribuidores oficiales con respaldo directo en Colombia
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTiendas('left')}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-slate-600 dark:text-slate-300 hover:text-violet-600 flex items-center justify-center shadow-xs transition cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollTiendas('right')}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-slate-600 dark:text-slate-300 hover:text-violet-600 flex items-center justify-center shadow-xs transition cursor-pointer"
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
                    <div className="h-28 w-full relative overflow-hidden bg-slate-950">
                      <img
                        src={coverImg}
                        alt={t.nombreTienda}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                    </div>

                    <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
                      <div className="flex items-end justify-between -mt-7 mb-2">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl border-3 border-white dark:border-slate-900 shadow-md overflow-hidden bg-slate-900 shrink-0">
                            {t.logoUrl ? (
                              <img src={t.logoUrl} alt={t.nombreTienda} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-white text-sm bg-gradient-to-br from-violet-600 to-emerald-600">
                                {t.nombreTienda?.charAt(0) || 'T'}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs">
                            <CheckCircle2 size={12} className="fill-emerald-500 text-white" />
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tienda/${t.id}`)
                          }}
                          className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-emerald-400 text-white hover:text-slate-950 font-extrabold text-xs transition cursor-pointer"
                        >
                          Ver Tienda
                        </button>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                            {t.nombreTienda}
                          </h3>
                          <BadgeCheck size={14} className="text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                          {t.ciudad || 'Colombia'} • Tienda Oficial Verificada
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

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
