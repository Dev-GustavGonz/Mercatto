import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Laptop,
  Shirt,
  Activity,
  Home,
  Sparkles,
  ArrowRight,
  Flame,
  Layers
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

export const HeroExplodedTower = ({ categorias = [], productos = [], onAddToCart }) => {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Configuración de las 4 verticales oficiales de Mercatto
  const officialCategoryConfigs = useMemo(() => [
    {
      dbId: 4,
      nombreDefecto: 'Deportes y Fitness',
      shortLabel: 'Deportes & Fitness',
      slugDefecto: 'deportes-fitness',
      icono: Activity,
      color: '#10b981',
      ctaBg: '#34d399',
      ctaText: '#022c22',
      glow: 'rgba(16, 185, 129, 0.24)',
      accentGradient: 'from-emerald-300 via-teal-200 to-emerald-400',
      headline: 'TODO EL RENDIMIENTO PRO,',
      highlight: 'EN UN SOLO LUGAR.',
      description: 'Conecta directo con tiendas oficiales verificadas en Colombia. Equipamiento de alto impacto, suplementación y tecnología deportiva con pago seguro Wompi.',
      defaultImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&auto=format&fit=crop&q=80',
      orbitImages: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', tag: 'Running Pro', frame: 'from-emerald-500 to-teal-700' },
        { url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80', tag: 'Pesas & Gym', frame: 'from-violet-600 to-indigo-900' },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80', tag: 'Smart Fitness', frame: 'from-amber-500 to-orange-700' },
        { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80', tag: 'CrossTraining', frame: 'from-sky-500 to-blue-800' }
      ],
      stats: [
        { label: 'Grado Profesional', val: 'Alta Resistencia', sub: 'Materiales Certificados' },
        { label: 'Cobertura Nacional', val: 'Despacho 24-48h', sub: 'Envío Protegido' },
        { label: 'Respaldo Oficial', val: 'Compra Segura', sub: 'Pasarela Wompi Colombia' }
      ]
    },
    {
      dbId: 1,
      nombreDefecto: 'Tecnología y Electrónica',
      shortLabel: 'Tecnología Pro',
      slugDefecto: 'tecnologia-electronica',
      icono: Laptop,
      color: '#34d399',
      ctaBg: '#34d399',
      ctaText: '#022c22',
      glow: 'rgba(139, 92, 246, 0.24)',
      accentGradient: 'from-emerald-300 via-cyan-200 to-violet-300',
      headline: 'POTENCIA DIGITAL &',
      highlight: 'HARDWARE DE VANGUARDIA.',
      description: 'Laptops, smartphones flagship, audio de alta fidelidad y periféricos Pro con garantía nacional directa de distribuidores autorizados.',
      defaultImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80',
      orbitImages: [
        { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80', tag: 'Workstations', frame: 'from-sky-500 to-indigo-800' },
        { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80', tag: 'Audio Hi-Res', frame: 'from-violet-600 to-purple-900' },
        { url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&auto=format&fit=crop&q=80', tag: 'Wearables', frame: 'from-emerald-500 to-teal-800' },
        { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80', tag: 'Flagship 5G', frame: 'from-amber-500 to-rose-700' }
      ],
      stats: [
        { label: 'Procesamiento', val: 'Serie Pro & Ultra', sub: 'Máximo Rendimiento' },
        { label: 'Pantallas', val: 'OLED & Retina', sub: 'Hasta 240Hz' },
        { label: 'Garantía Oficial', val: '100% Verificada', sub: 'En Toda Colombia' }
      ]
    },
    {
      dbId: 2,
      nombreDefecto: 'Moda y Ropa',
      shortLabel: 'Moda & Streetwear',
      slugDefecto: 'moda-ropa',
      icono: Shirt,
      color: '#a78bfa',
      ctaBg: '#34d399',
      ctaText: '#022c22',
      glow: 'rgba(167, 139, 250, 0.24)',
      accentGradient: 'from-emerald-300 via-violet-200 to-fuchsia-300',
      headline: 'ESTILO URBANO &',
      highlight: 'EDICIONES EXCLUSIVAS.',
      description: 'Prendas de autor, calzado deportivo de colección y accesorios originales con autenticidad garantizada y envíos rápidos.',
      defaultImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
      orbitImages: [
        { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80', tag: 'Sneakers Drop', frame: 'from-rose-500 to-red-800' },
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80', tag: 'Streetwear', frame: 'from-violet-600 to-indigo-900' },
        { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80', tag: 'Accesorios', frame: 'from-emerald-500 to-teal-800' },
        { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=80', tag: 'Outerwear', frame: 'from-amber-500 to-orange-800' }
      ],
      stats: [
        { label: 'Autenticidad', val: 'Sello Original', sub: 'Tiendas Oficiales' },
        { label: 'Temporada 2026', val: 'Drops Semanales', sub: 'Stock Inmediato' },
        { label: 'Cambios Fáciles', val: 'Compra Protegida', sub: 'Respaldo Mercatto' }
      ]
    },
    {
      dbId: 3,
      nombreDefecto: 'Hogar y Muebles',
      shortLabel: 'Hogar & Setup',
      slugDefecto: 'hogar-muebles',
      icono: Home,
      color: '#34d399',
      ctaBg: '#34d399',
      ctaText: '#022c22',
      glow: 'rgba(16, 185, 129, 0.24)',
      accentGradient: 'from-emerald-300 via-amber-200 to-teal-300',
      headline: 'DISEÑO MODERNO &',
      highlight: 'ESPACIOS QUE INSPIRAN.',
      description: 'Mobiliario ergonómico, iluminación inteligente y equipamiento de confort para transformar tu hogar o tu estudio profesional.',
      defaultImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=900&auto=format&fit=crop&q=80',
      orbitImages: [
        { url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop&q=80', tag: 'Diseño Interior', frame: 'from-emerald-500 to-teal-800' },
        { url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400&auto=format&fit=crop&q=80', tag: 'Ergonomía Pro', frame: 'from-amber-500 to-orange-800' },
        { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&auto=format&fit=crop&q=80', tag: 'Smart Home', frame: 'from-violet-600 to-indigo-900' },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80', tag: 'Cocina & Autor', frame: 'from-sky-500 to-blue-800' }
      ],
      stats: [
        { label: 'Ergonomía', val: 'Confort Premium', sub: 'Calidad de Exportación' },
        { label: 'Acabados', val: 'Alta Durabilidad', sub: 'Maderas & Metales' },
        { label: 'Logística', val: 'Embalaje Seguro', sub: 'Cobertura Colombia' }
      ]
    }
  ], [])

  // Enlazar las 4 pestañas con datos reales de categorías y productos del catálogo
  const activePillars = useMemo(() => {
    return officialCategoryConfigs.map((cfg) => {
      const dbCategory = categorias.find((c) => c.id === cfg.dbId) || null
      const catId = dbCategory?.id || cfg.dbId
      const catNombre = dbCategory?.nombre || cfg.nombreDefecto

      const categoryProducts = productos.filter((p) => {
        if (!p) return false
        return p.categoria?.id === catId || p.categoriaId === catId
      })

      const realProd = categoryProducts[0] || productos[0] || null

      const orbitCards = cfg.orbitImages.map((orb, idx) => {
        const candidate = categoryProducts[idx] || productos[idx] || null
        const imgUrl =
          candidate?.imagenes?.find((i) => i.principal)?.url ||
          candidate?.imagenes?.[0]?.url ||
          candidate?.imagenUrl ||
          orb.url

        return {
          id: candidate?.id || null,
          title: candidate?.titulo || candidate?.nombre || orb.tag,
          price: candidate?.precioOferta || candidate?.precio || null,
          tag: orb.tag,
          image: imgUrl,
          frame: orb.frame
        }
      })

      return {
        ...cfg,
        id: catId,
        nombre: catNombre,
        realProduct: realProd,
        displayImage:
          realProd?.imagenes?.find((i) => i.principal)?.url ||
          realProd?.imagenes?.[0]?.url ||
          realProd?.imagenUrl ||
          cfg.defaultImage,
        productTitle: realProd?.titulo || realProd?.nombre || catNombre,
        productPrice: realProd?.precioOferta || realProd?.precio || null,
        orbitCards
      }
    })
  }, [categorias, productos, officialCategoryConfigs])

  const currentPillar = activePillars[activeIndex] || activePillars[0]

  // Rotación automática cada 4 segundos; recupera los cambios al volver a la pestaña.
  useEffect(() => {
    if (isPaused || activePillars.length < 2) return

    const rotationInterval = 4000
    let nextChange = Date.now() + rotationInterval

    const rotateIfDue = () => {
      const now = Date.now()
      if (now < nextChange) return

      const elapsedRotations = Math.floor((now - nextChange) / rotationInterval) + 1
      nextChange += elapsedRotations * rotationInterval
      setActiveIndex((prev) => (prev + elapsedRotations) % activePillars.length)
    }

    const interval = setInterval(rotateIfDue, 1000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') rotateIfDue()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPaused, activePillars.length])


  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
    setIsPaused(false)
  }

  const handleNavigateToCategory = (catId) => {
    navigate(`/catalogo?categoriaId=${catId}`)
  }

  const IconoActual = currentPillar.icono || Sparkles

  // Configuraciones de estilo para las 4 tarjetas superpuestas (2 a la izquierda y 2 a la derecha)
  const orbitStyles = [
    { rotate: -8, badgeColor: 'bg-emerald-400 text-slate-950', offsetClass: '-translate-x-2 xl:-translate-x-4' },
    { rotate: -12, badgeColor: 'bg-violet-500 text-white', offsetClass: 'translate-x-3 xl:translate-x-5' },
    { rotate: 8, badgeColor: 'bg-amber-400 text-slate-950', offsetClass: 'translate-x-2 xl:translate-x-4' },
    { rotate: 12, badgeColor: 'bg-emerald-400 text-slate-950', offsetClass: '-translate-x-3 xl:-translate-x-5' }
  ]

  const renderFloatingCard = (card, idx) => {
    const st = orbitStyles[idx] || orbitStyles[0]
    const parallaxX = mousePos.x * (idx % 2 === 0 ? 18 : -18)
    const parallaxY = mousePos.y * (idx < 2 ? 14 : -14)

    return (
      <div
        key={idx}
        onClick={() =>
          card.id
            ? navigate(`/producto/${card.id}`)
            : handleNavigateToCategory(currentPillar.id)
        }
        style={{
          transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0) rotate(${st.rotate}deg)`
        }}
        className={`relative w-32 h-36 sm:w-36 sm:h-44 rounded-3xl p-1.5 bg-gradient-to-br ${card.frame} ${st.offsetClass} shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] border border-white/25 cursor-pointer group transition-transform duration-300 ease-out hover:scale-110 hover:z-30`}
      >
        {/* Etiqueta flotante superior */}
        <div
          className={`absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md z-10 ${st.badgeColor}`}
        >
          {card.price ? formatCurrency(card.price) : card.tag}
        </div>

        {/* Marco interno con imagen y overlay oscuro */}
        <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 relative">
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
            <p className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-wider truncate">
              {card.tag}
            </p>
            <p className="text-[11px] font-bold text-white truncate">
              {card.title}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const leftCards = currentPillar.orbitCards.slice(0, 2)
  const rightCards = currentPillar.orbitCards.slice(2, 4)

  return (
    /* ======================================================================= */
    /* CONTENEDOR HERO 100% FULL-WIDTH SIN BORDES EXTERNOS NI MÁRGENES FORZADOS*/
    /* ======================================================================= */
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[620px] lg:min-h-[680px] bg-gradient-to-b from-[#030907] via-[#05130e] to-[#0b0f19] text-white overflow-hidden select-none border-b border-white/10"
    >
      {/* Textura de imagen de fondo sutil en la parte inferior con fusión limpia */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 opacity-20 transition-all duration-1000 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url('${currentPillar.displayImage}')`,
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 85%)'
        }}
      />

      {/* Atmósfera radial adaptativa a pantalla completa */}
      <div
        className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${currentPillar.glow} 0%, rgba(5, 11, 9, 0.88) 65%, transparent 100%)`
        }}
      />

      {/* Resplandores ambientales laterales */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Líneas de perspectiva radiales a ancho completo */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none"
        viewBox="0 0 1600 800"
        preserveAspectRatio="none"
      >
        <g stroke="url(#mercattoFullRayGrad)" strokeWidth="1.2">
          {[...Array(32)].map((_, i) => {
            const angle = (i / 32) * Math.PI * 2
            const x2 = 800 + Math.cos(angle) * 1200
            const y2 = 380 + Math.sin(angle) * 800
            return <line key={i} x1="800" y1="380" x2={x2} y2={y2} />
          })}
        </g>
        <defs>
          <radialGradient id="mercattoFullRayGrad" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="35%" stopColor="#34d399" stopOpacity="0.65" />
            <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </radialGradient>
        </defs>
      </svg>

      {/* ===================================================================== */}
      {/* CONTENEDOR FLUIDO INTERNO PARA ALINEAR EL CONTENIDO                   */}
      {/* ===================================================================== */}
      <div className="relative z-20 container max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-10 min-h-[620px] lg:min-h-[680px] flex flex-col justify-between gap-8">

        {/* 1. NAVEGACIÓN SUPERIOR INTEGRADA (LOGO + PILL TABS DE ALTO CONTRASTE) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Identidad izquierda */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto">

          </div>

        </div>


        {/* 2. ESCENARIO CENTRAL: GRILLA FLUIDA (TARJETAS IZQUIERDA + TEXTO CENTRAL + TARJETAS DERECHA) */}
        <div className="my-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-6 py-4">

          {/* Columna Izquierda: 2 Tarjetas Flotantes Superpuestas */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-6">
            {leftCards.map((card, i) => renderFloatingCard(card, i))}
          </div>

          {/* Columna Central: Textos Principales, Subtítulos y Botones CTA */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center text-center px-2 sm:px-6 z-20">



            {/* Título Principal en Mayúsculas de Alto Impacto */}
            <h1 className="max-w-4xl mx-auto text-3xl sm:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.06] uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              {currentPillar.headline}
              <span
                className={`block mt-1.5 text-transparent bg-clip-text bg-gradient-to-r ${currentPillar.accentGradient}`}
              >
                {currentPillar.highlight}
              </span>
            </h1>

            {/* Subtítulo Descriptivo */}
            <p className="mt-5 max-w-2xl mx-auto text-xs sm:text-base text-slate-200/90 font-medium leading-relaxed">
              {currentPillar.description}
            </p>

            {/* Botones de Llamada a la Acción (CTA) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleNavigateToCategory(currentPillar.id)}
                className="px-7 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_40px_-5px_rgba(52,211,153,0.65)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>Explorar {currentPillar.nombre}</span>
                <ArrowRight size={16} className="stroke-[2.5]" />
              </button>


            </div>

            {/* Tarjetas flotantes en pantallas medianas/tablets (debajo del CTA para no chocar con el texto) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 lg:hidden">
              {currentPillar.orbitCards.map((card, idx) => renderFloatingCard(card, idx))}
            </div>
          </div>

          {/* Columna Derecha: 2 Tarjetas Flotantes Superpuestas */}
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center gap-6">
            {rightCards.map((card, i) => renderFloatingCard(card, i + 2))}
          </div>

        </div>

        {/* 3. BASE DEL HERO: TARJETAS PRO TRANSLÚCIDAS Y DESTACADO DE CATEGORÍA */}
        <div className="pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentPillar.stats.map((st, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 backdrop-blur-xl flex items-center justify-between transition-all duration-300"
              >
                <div>
                  <p className="text-[10px] font-bold text-emerald-300/90 uppercase tracking-wider">
                    {st.label}
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                    {st.val}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{st.sub}</p>
                </div>
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-violet-500" />
              </div>
            ))}
          </div>

          {/* Mini-Card Destacada del Producto Insignia */}
          <div
            onClick={() =>
              currentPillar.realProduct?.id
                ? navigate(`/producto/${currentPillar.realProduct.id}`)
                : handleNavigateToCategory(currentPillar.id)
            }
            className="md:col-span-4 p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-emerald-950/70 to-violet-950/80 border border-emerald-400/30 backdrop-blur-xl flex items-center justify-between gap-3 cursor-pointer group hover:border-emerald-400/70 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentPillar.displayImage}
                alt={currentPillar.productTitle}
                className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 block">
                  DESTACADO PRO
                </span>
                <p className="text-xs font-extrabold text-white truncate">
                  {currentPillar.productTitle}
                </p>
                {currentPillar.productPrice && (
                  <p className="text-xs font-black text-emerald-400">
                    {formatCurrency(currentPillar.productPrice)} COP
                  </p>
                )}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
              <ArrowRight size={14} />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default HeroExplodedTower
