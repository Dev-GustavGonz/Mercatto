import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatCurrency'
import { ArrowRight, Sparkles, Flame, Clock } from 'lucide-react'

export const PromotionalBento = ({ productos = [], onAddToCart }) => {
  const navigate = useNavigate()

  // Cronómetro regresivo en tiempo real (Días, Horas, Minutos, Segundos)
  const [timeLeft, setTimeLeft] = useState({
    dias: '00',
    horas: '08',
    minutos: '32',
    segundos: '45'
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const ahora = new Date()
      const finDelDia = new Date()
      finDelDia.setHours(23, 59, 59, 999)
      const diff = Math.max(0, finDelDia - ahora)

      const horas = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0')
      const minutos = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0')
      const segundos = String(Math.floor((diff / 1000) % 60)).padStart(2, '0')

      setTimeLeft({ dias: '00', horas, minutos, segundos })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Productos dinámicos desde props o catálogo
  const pOferta = productos[0] || null
  const pNovedad = productos[1] || productos[0] || null
  const pTemporada = productos[2] || productos[1] || productos[0] || null

  const getImgUrl = (p, fallback) => {
    return (
      p?.imagenes?.find(i => i.principal)?.url ||
      p?.imagenes?.[0]?.url ||
      fallback
    )
  }

  const imgOferta = getImgUrl(
    pOferta, 
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80'
  )
  const imgNovedad = getImgUrl(
    pNovedad, 
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  )
  const imgTemporada = getImgUrl(
    pTemporada, 
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
  )

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      
      {/* ============================================================== */}
      {/* TARJETA 1: SALE OF THE MONTH CON CRONÓMETRO REGRESIVO         */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pOferta ? `/producto/${pOferta.id}` : '/catalogo?enOferta=true')}
        className="group relative rounded-3xl p-7 bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#1E1B4B] text-white overflow-hidden shadow-xl shadow-sky-950/20 border border-sky-400/20 flex flex-col justify-between min-h-[380px] cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* Glow de fondo */}
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado con Timer */}
        <div className="relative z-10 space-y-4 text-center">
          <span className="text-[11px] font-black tracking-widest uppercase text-sky-200">
            Mejores Ofertas
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Oferta del Mes
          </h3>

          {/* Reloj Digital Funcional (DD : HH : MM : SS) */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 text-xs font-mono font-black">
            <Clock size={14} className="text-sky-300" />
            <div className="flex items-center gap-1.5">
              <span>{timeLeft.dias}<small className="text-[9px] font-sans text-sky-200 block">DÍAS</small></span>
              <span className="text-sky-300 font-bold">:</span>
              <span>{timeLeft.horas}<small className="text-[9px] font-sans text-sky-200 block">HRS</small></span>
              <span className="text-sky-300 font-bold">:</span>
              <span>{timeLeft.minutos}<small className="text-[9px] font-sans text-sky-200 block">MIN</small></span>
              <span className="text-sky-300 font-bold">:</span>
              <span className="text-amber-300">{timeLeft.segundos}<small className="text-[9px] font-sans text-sky-200 block">SEG</small></span>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-md group-hover:scale-105 transition-transform">
              <span>Comprar Ahora</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Imagen Flotante del Producto */}
        <div className="relative z-10 w-full h-44 flex items-center justify-center pt-4">
          <img
            src={imgOferta}
            alt={pOferta?.titulo || 'Oferta del Mes'}
            className="max-h-40 w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500"
          />
        </div>

        {/* Nombre del Producto en la base */}
        <div className="relative z-10 text-center text-xs text-sky-100/90 font-bold line-clamp-1 pt-2">
          {pOferta?.titulo || 'Smartwatch & Wearables Flagship'}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETA 2: NOVEDAD EN FONDO OSCURO OBSIDIANA                   */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pNovedad ? `/producto/${pNovedad.id}` : '/catalogo?orden=recientes')}
        className="group relative rounded-3xl p-7 bg-gradient-to-b from-[#111319] via-[#0B0C10] to-[#1E1B4B] text-white overflow-hidden shadow-xl shadow-black/40 border border-slate-800 flex flex-col justify-between min-h-[380px] cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-52 h-52 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 text-center">
          <span className="text-[11px] font-black tracking-widest uppercase text-violet-400">
            Novedad Exclusiva
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {pNovedad?.titulo || 'Audio Hi-Res Pro'}
          </h3>
          <p className="text-xs text-slate-400 font-semibold">
            Desde <span className="text-violet-400 font-black text-sm">{formatCurrency(pNovedad?.precio || 249900)}</span>
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs backdrop-blur-md group-hover:scale-105 transition-all">
              <span>Explorar Novedad</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Imagen Flotante */}
        <div className="relative z-10 w-full h-44 flex items-center justify-center pt-4">
          <img
            src={imgNovedad}
            alt={pNovedad?.titulo || 'Novedad'}
            className="max-h-40 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)] group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"
          />
        </div>

        <div className="relative z-10 text-center text-xs text-slate-400 font-bold line-clamp-1 pt-2">
          {pNovedad?.marca ? `Marca oficial ${pNovedad.marca}` : 'Garantía oficial y entrega nacional'}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETA 3: LIQUIDACIÓN DE TEMPORADA (ESTILO UNDER ARMOUR)      */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pTemporada ? `/producto/${pTemporada.id}` : '/catalogo?enOferta=true')}
        className="group relative rounded-3xl p-7 bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[380px] cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative z-10 space-y-2 text-center">
          <span className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
            Promoción de Verano
          </span>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight">
            {pTemporada?.marca || 'Calzado & Moda'}
          </h3>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-black">
            <Flame size={14} className="text-amber-500" />
            <span>Hasta 50% OFF</span>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs font-black text-violet-600 dark:text-violet-400 group-hover:gap-3 transition-all">
              <span>Ver Colección</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>

        {/* Imagen del Producto */}
        <div className="relative z-10 w-full h-44 flex items-center justify-center pt-4">
          <img
            src={imgTemporada}
            alt={pTemporada?.titulo || 'Temporada'}
            className="max-h-40 w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
          />
        </div>

        <div className="relative z-10 text-center text-xs text-slate-500 dark:text-slate-400 font-bold line-clamp-1 pt-2">
          {pTemporada?.titulo || 'Prendas y calzado con stock inmediato'}
        </div>
      </div>

    </section>
  )
}

export default PromotionalBento
