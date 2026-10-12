import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatCurrency'
import { ArrowRight, Sparkles, Flame, Clock, Zap } from 'lucide-react'

export const PromotionalBento = ({ productos = [], onAddToCart }) => {
  const navigate = useNavigate()

  // Cronómetro regresivo en tiempo real (Días, Horas, Minutos, Segundos)
  const [timeLeft, setTimeLeft] = useState({
    dias: '02',
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

      setTimeLeft({ dias: '02', horas, minutos, segundos })
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
      p?.imagenUrl ||
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
      {/* TARJETA 1: OFERTA DEL MES CON CRONÓMETRO REGRESIVO DE URGENCIA */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pOferta ? `/producto/${pOferta.id}` : '/catalogo?enOferta=true')}
        className="group relative rounded-3xl p-7 bg-gradient-to-b from-[#042f2e] via-[#05201c] to-[#030b09] text-white overflow-hidden shadow-2xl shadow-emerald-950/30 border border-emerald-400/25 flex flex-col justify-between min-h-[410px] cursor-pointer hover:shadow-emerald-900/40 hover:border-emerald-400/50 hover:-translate-y-1.5 transition-all duration-300"
      >
        {/* Textura de imagen sutil en la parte inferior con overlay oscuro translúcido */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 bg-cover bg-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${imgOferta}')`,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
          }}
        />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado con Timer de Urgencia */}
        <div className="relative z-10 space-y-3.5 text-center">

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight">
            OFERTA <span className="text-emerald-400">DEL MES</span>
          </h3>

          {/* Reloj Digital Funcional (DD : HH : MM : SS) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/15 text-xs font-mono font-black shadow-inner">
            <Clock size={14} className="text-emerald-400 shrink-0" />
            <div className="flex items-center gap-2">
              <div>
                <span className="text-sm text-white">{timeLeft.dias}</span>
                <small className="text-[8px] font-sans text-emerald-300/80 block tracking-wider">DÍAS</small>
              </div>
              <span className="text-emerald-400 font-bold">:</span>
              <div>
                <span className="text-sm text-white">{timeLeft.horas}</span>
                <small className="text-[8px] font-sans text-emerald-300/80 block tracking-wider">HRS</small>
              </div>
              <span className="text-emerald-400 font-bold">:</span>
              <div>
                <span className="text-sm text-white">{timeLeft.minutos}</span>
                <small className="text-[8px] font-sans text-emerald-300/80 block tracking-wider">MIN</small>
              </div>
              <span className="text-emerald-400 font-bold">:</span>
              <div>
                <span className="text-sm text-amber-300">{timeLeft.segundos}</span>
                <small className="text-[8px] font-sans text-emerald-300/80 block tracking-wider">SEG</small>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(52,211,153,0.4)] group-hover:scale-105 transition-all">
              <span>Comprar Ahora</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Imagen Flotante del Producto Pro */}
        <div className="relative z-10 w-full h-40 flex items-center justify-center pt-3">
          <img
            src={imgOferta}
            alt={pOferta?.titulo || 'Oferta del Mes'}
            className="max-h-36 w-auto object-contain rounded-2xl drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)] group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-500"
          />
        </div>

        {/* Nombre del Producto en la base con barra oscura translúcida */}
        <div className="relative z-10 px-3 py-2 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-center text-xs text-emerald-100 font-bold truncate">
          {pOferta?.titulo || 'Smartwatch & Wearables Flagship Pro'}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETA 2: DESTACADO PRO EN FONDO OSCURO VIOLETA / OBSIDIANA   */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pNovedad ? `/producto/${pNovedad.id}` : '/catalogo?orden=recientes')}
        className="group relative rounded-3xl p-7 bg-gradient-to-b from-[#130f26] via-[#0d0b18] to-[#05050a] text-white overflow-hidden shadow-2xl shadow-violet-950/25 border border-violet-500/25 flex flex-col justify-between min-h-[410px] cursor-pointer hover:border-violet-400/50 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div 
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 bg-cover bg-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${imgNovedad}')`,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
          }}
        />
        <div className="absolute top-0 right-0 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 text-center">

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight line-clamp-1">
            {pNovedad?.titulo ? (
              <>
                <span className="text-violet-400">PRO</span> {pNovedad.titulo}
              </>
            ) : (
              <>
                AUDIO <span className="text-violet-400">HI-RES PRO</span>
              </>
            )}
          </h3>

          <p className="text-xs text-slate-300 font-semibold">
            Precio Oficial:{' '}
            <span className="text-emerald-400 font-black text-sm">
              {formatCurrency(pNovedad?.precioOferta || pNovedad?.precio || 249900)} COP
            </span>
          </p>

          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_8px_25px_rgba(124,58,237,0.45)] group-hover:scale-105 transition-all">
              <span>Explorar Pro</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Imagen Flotante */}
        <div className="relative z-10 w-full h-40 flex items-center justify-center pt-3">
          <img
            src={imgNovedad}
            alt={pNovedad?.titulo || 'Novedad Pro'}
            className="max-h-36 w-auto object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.75)] group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"
          />
        </div>

        <div className="relative z-10 px-3 py-2 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-center text-xs text-slate-300 font-bold truncate">
          {pNovedad?.marca ? `Distribuidor Oficial ${pNovedad.marca}` : 'Garantía Oficial y Entrega en Colombia'}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TARJETA 3: RENDIMIENTO & LIQUIDACIÓN CON OVERLAY OSCURO PRO    */}
      {/* ============================================================== */}
      <div 
        onClick={() => navigate(pTemporada ? `/producto/${pTemporada.id}` : '/catalogo?enOferta=true')}
        className="group relative rounded-3xl p-7 bg-gradient-to-b from-[#0f172a] via-[#091318] to-[#040d0a] text-white overflow-hidden shadow-2xl shadow-slate-950/30 border border-white/15 flex flex-col justify-between min-h-[410px] cursor-pointer hover:border-emerald-400/40 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div 
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 bg-cover bg-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('${imgTemporada}')`,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
          }}
        />
        <div className="absolute -top-10 -left-10 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight uppercase tracking-tight line-clamp-1">
            {pTemporada?.marca || 'EQUIPAMIENTO'}{' '}
            <span className="text-emerald-400">PRO</span>
          </h3>

          <p className="text-xs text-slate-300 font-semibold">
            Stock verificado para despacho inmediato
          </p>

          <div className="pt-1">
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg group-hover:scale-105 transition-all">
              <span>Ver Colección</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Imagen del Producto */}
        <div className="relative z-10 w-full h-40 flex items-center justify-center pt-3">
          <img
            src={imgTemporada}
            alt={pTemporada?.titulo || 'Temporada'}
            className="max-h-36 w-auto object-contain rounded-2xl drop-shadow-[0_20px_25px_rgba(0,0,0,0.65)] group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500"
          />
        </div>

        <div className="relative z-10 px-3 py-2 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-md text-center text-xs text-slate-300 font-bold truncate">
          {pTemporada?.titulo || 'Calzado, Deportes & Accesorios Originales'}
        </div>
      </div>

    </section>
  )
}

export default PromotionalBento
