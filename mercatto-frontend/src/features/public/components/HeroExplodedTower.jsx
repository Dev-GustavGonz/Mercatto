import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Laptop, 
  Shirt, 
  Activity, 
  Home, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Eye, 
  ShoppingBag
} from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

export const HeroExplodedTower = ({ categorias = [], productos = [], onAddToCart }) => {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Mapeo estilizado de las 4 categorías principales oficiales de la base de datos de Mercatto
  const officialCategoryConfigs = useMemo(() => [
    {
      dbId: 1,
      nombreDefecto: 'Tecnología y Electrónica',
      slugDefecto: 'tecnologia-electronica',
      badge: 'TECH & PRODUCTIVIDAD',
      icono: Laptop,
      color: '#38bdf8', // Azul Cobalto
      glow: 'rgba(56, 189, 248, 0.22)',
      gradient: 'from-sky-400 via-blue-300 to-indigo-200',
      headline: 'Potencia Digital &',
      highlight: 'Dispositivos de Vanguardia.',
      description: 'Laptops, smartphones, audio de alta fidelidad y componentes de alto rendimiento para creadores y profesionales.',
      defaultImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      stats: [
        { label: 'Procesamiento', val: 'Intel & M-Series', sub: 'Alto Rendimiento' },
        { label: 'Pantallas', val: 'Retina & OLED', sub: 'Hasta 240Hz' },
        { label: 'Garantía Oficial', val: '2 Años Nacional', sub: 'En Colombia' }
      ]
    },
    {
      dbId: 2,
      nombreDefecto: 'Moda y Ropa',
      slugDefecto: 'moda-ropa',
      badge: 'STREETWEAR & TENDENCIA',
      icono: Shirt,
      color: '#ef4444', // Rojo Fuego
      glow: 'rgba(239, 68, 68, 0.22)',
      gradient: 'from-red-400 via-rose-300 to-amber-300',
      headline: 'Estilo Urbano &',
      highlight: 'Colecciones de Temporada.',
      description: 'Prendas exclusivas, calzado deportivo de colección y accesorios con autenticidad y calidad 100% verificada.',
      defaultImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      stats: [
        { label: 'Autenticidad', val: '100% Verificada', sub: 'Control de Calidad' },
        { label: 'Drops Semanales', val: 'Ediciones Limitadas', sub: 'Primeras Marcas' },
        { label: 'Envíos Nacionales', val: 'A Toda Colombia', sub: 'Seguro Wompi' }
      ]
    },
    {
      dbId: 4,
      nombreDefecto: 'Deportes y Fitness',
      slugDefecto: 'deportes-fitness',
      badge: 'RENDIMIENTO Y SALUD',
      icono: Activity,
      color: '#10b981', // Verde Esmeralda
      glow: 'rgba(16, 185, 129, 0.22)',
      gradient: 'from-emerald-400 via-teal-300 to-cyan-300',
      headline: 'Equipamiento Pro &',
      highlight: 'Máximo Rendimiento Físico.',
      description: 'Implementos para entrenamiento, indumentaria deportiva de alto impacto y accesorios para superar tus marcas.',
      defaultImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      stats: [
        { label: 'Grado Pro', val: 'Alta Resistencia', sub: 'Materiales Premium' },
        { label: 'Variedad', val: 'Multidisciplina', sub: 'Crossfit / Gym / Running' },
        { label: 'Despacho Rápido', val: '24-48 Horas', sub: 'Cobertura Nacional' }
      ]
    },
    {
      dbId: 3,
      nombreDefecto: 'Hogar y Muebles',
      slugDefecto: 'hogar-muebles',
      badge: 'CONFORT & ESPACIOS',
      icono: Home,
      color: '#f59e0b', // Ámbar Oro
      glow: 'rgba(245, 158, 11, 0.22)',
      gradient: 'from-amber-400 via-orange-300 to-yellow-200',
      headline: 'Diseño Moderno &',
      highlight: 'Espacios que Inspiran.',
      description: 'Mobiliario ergonómico, iluminación ambiental y artículos de confort para transformar tu hogar o tu setup de trabajo.',
      defaultImage: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80',
      stats: [
        { label: 'Ergonomía', val: 'Diseño Certificado', sub: 'Postura y Confort' },
        { label: 'Acabados', val: 'Madera & Metal', sub: 'Durabilidad Asegurada' },
        { label: 'Entrega Segura', val: 'Embalaje Especial', sub: 'Todo Colombia' }
      ]
    }
  ], [])

  // Construir las 4 pestañas enlazando con la base de datos real
  const activePillars = useMemo(() => {
    return officialCategoryConfigs.map((cfg) => {
      // Buscar en la lista de categorias reales de la BD
      const dbCategory = categorias.find((c) => c.id === cfg.dbId) || null
      const catId = dbCategory?.id || cfg.dbId
      const catNombre = dbCategory?.nombre || cfg.nombreDefecto

      // Buscar si hay un producto real de esa categoria en los productos cargados
      const realProd = productos.find((p) => {
        if (!p) return false
        return p.categoria?.id === catId || p.categoriaId === catId
      }) || null

      return {
        ...cfg,
        id: catId,
        nombre: catNombre,
        realProduct: realProd,
        displayImage: realProd?.imagenUrl || (realProd?.imagenes && realProd.imagenes[0]?.url) || cfg.defaultImage,
        productTitle: realProd?.titulo || realProd?.nombre || catNombre,
        productPrice: realProd?.precio || null
      }
    })
  }, [categorias, productos, officialCategoryConfigs])

  const currentPillar = activePillars[activeIndex] || activePillars[0]

  // Ciclo automático suave de 6.5 segundos (se pausa si el usuario pasa el ratón por encima)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activePillars.length)
    }, 6500)
    return () => clearInterval(interval)
  }, [isPaused, activePillars.length])

  // Parallax interactivo con el ratón
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

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="w-full h-[calc(100vh-85px)] min-h-[580px] max-h-[820px] relative rounded-[36px] bg-[#030508] border border-violet-950/40 p-6 sm:p-10 flex flex-col justify-between overflow-hidden shadow-[0_30px_90px_-20px_rgba(109,40,217,0.3)] select-none transition-colors duration-1000"
    >
      {/* ATMÓSFERA PROFUNDA DE NEÓN ADAPTATIVA SEGÚN LA CATEGORÍA ACTIVA */}
      <div 
        className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 68% 50%, ${currentPillar.glow} 0%, rgba(3, 5, 8, 0.95) 70%)`
        }}
      />
      <div 
        className="absolute -top-32 right-1/4 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 opacity-60"
        style={{ backgroundColor: currentPillar.color }}
      />
      <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-violet-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR: BADGE MERCATTO + EXACTAMENTE 4 PESTAÑAS (CERO SCROLL) */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Badge Institucional */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
          <span 
            className="w-2 h-2 rounded-full animate-ping" 
            style={{ backgroundColor: currentPillar.color }} 
          />
          <span className="text-[11px] font-black tracking-widest uppercase text-slate-300">
            MERCATTO SHOWCASE // 2026
          </span>
        </div>

        {/* EXACTAMENTE 4 CÁPSULAS FIJAS LIMPIAS (SIN BARRAS DE SCROLL NI DESBORDAMIENTO) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-1 rounded-2xl backdrop-blur-xl">
          {activePillars.map((pillar, idx) => {
            const isSelected = idx === activeIndex
            const PillarIcon = pillar.icono || Sparkles
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  isSelected 
                    ? 'text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'transparent',
                  borderColor: isSelected ? pillar.color : 'transparent'
                }}
              >
                <PillarIcon size={14} style={{ color: isSelected ? pillar.color : 'currentColor' }} />
                <span>{pillar.nombre}</span>

                {/* Línea indicadora activa */}
                {isSelected && (
                  <span 
                    className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full shadow-md" 
                    style={{ backgroundColor: pillar.color }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ESCENARIO CENTRAL: CONTENIDO DINÁMICO + ESCAPARATE DE PRODUCTO 3D       */}
      {/* ========================================================================= */}
      <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN DE LA CATEGORÍA Y REDIRECCIÓN AL CATÁLOGO */}
        <div className="lg:col-span-6 space-y-4 max-w-xl">
          
          {/* Badge del Pilar Activo */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold tracking-wide backdrop-blur-md"
            style={{
              borderColor: `${currentPillar.color}40`,
              backgroundColor: `${currentPillar.color}15`,
              color: currentPillar.color
            }}
          >
            <IconoActual size={14} />
            <span>{currentPillar.badge}</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase">
            {currentPillar.headline}{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentPillar.gradient}`}>
              {currentPillar.highlight}
            </span>
          </h1>

          {/* Descripción */}
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            {currentPillar.description}
          </p>

          {/* Botón de Acción Directa hacia el Catálogo Filtrado con categoriaId */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleNavigateToCategory(currentPillar.id)}
              className="px-6 py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: currentPillar.color,
                boxShadow: `0 10px 30px -5px ${currentPillar.color}60`
              }}
            >
              <span>Explorar {currentPillar.nombre}</span>
              <ArrowRight size={16} />
            </button>

            {/* Badges de Confianza de Mercatto */}
            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <Truck size={13} className="text-violet-400" />
                <span>Envíos Wompi a Colombia</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Garantía Oficial</span>
              </span>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: ESCAPARATE DE PRODUCTO FOTOREALISTA CON PARALLAX 3D */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          
          {/* Tarjeta flotante con inclinación 3D que redirige al hacer clic */}
          <div 
            className="relative w-full max-w-[480px] aspect-[4/3] rounded-3xl overflow-hidden transition-transform duration-300 ease-out cursor-pointer group"
            onClick={() => {
              if (currentPillar.realProduct?.id) {
                navigate(`/producto/${currentPillar.realProduct.id}`)
              } else {
                handleNavigateToCategory(currentPillar.id)
              }
            }}
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 10}deg) scale(${isPaused ? 1.03 : 1.0})`,
              boxShadow: `0 25px 60px -15px ${currentPillar.color}40`
            }}
          >
            {/* Imagen del Producto Real o Fotografía Insignia */}
            <img 
              src={currentPillar.displayImage} 
              alt={currentPillar.productTitle}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            />

            {/* Viñeta y reflejo de luz */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />

            {/* Ficha flotante sobre la imagen con precio y nombre real */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800/80 backdrop-blur-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {currentPillar.realProduct ? 'Producto en Catálogo' : 'Insignia de Categoría'}
                </p>
                <p className="text-xs sm:text-sm font-black text-white truncate max-w-[220px]">
                  {currentPillar.productTitle}
                </p>
                {currentPillar.productPrice && (
                  <p className="text-xs font-black text-emerald-400">
                    {formatCurrency(currentPillar.productPrice)} COP
                  </p>
                )}
              </div>

              <div 
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                style={{
                  backgroundColor: `${currentPillar.color}25`,
                  color: currentPillar.color,
                  border: `1px solid ${currentPillar.color}40`
                }}
              >
                <span>Ver en Catálogo</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA INFERIOR: MÉTRICAS Y TELEMETRÍA DE LA CATEGORÍA ACTIVA           */}
      {/* ========================================================================= */}
      <div className="relative z-20 pt-4 border-t border-slate-900/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentPillar.stats.map((st, i) => (
          <div 
            key={i} 
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 backdrop-blur-md flex items-center justify-between transition-all duration-500 hover:border-slate-700"
          >
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{st.label}</p>
              <p className="text-lg font-black text-white tracking-tight">{st.val}</p>
              <p className="text-[10px] text-slate-500 font-mono">{st.sub}</p>
            </div>
            <div 
              className="w-2 h-8 rounded-full opacity-70"
              style={{ backgroundColor: currentPillar.color }}
            />
          </div>
        ))}
      </div>

    </div>
  )
}

export default HeroExplodedTower
