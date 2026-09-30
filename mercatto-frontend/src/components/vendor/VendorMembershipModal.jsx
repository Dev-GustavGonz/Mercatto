import React, { useState } from 'react'
import { Sparkles, Check, ShieldCheck, Zap, Crown, ArrowRight } from 'lucide-react'
import vendedorService from '../../services/vendedorService'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../utils/formatCurrency'

export const VendorMembershipModal = ({ perfil, onClose, onActualizado }) => {
  const [planSeleccionado, setPlanSeleccionado] = useState(perfil?.tipoSuscripcion || 'STARTER')
  const [procesando, setProcesando] = useState(false)
  const { success, error } = useToast()

  const planes = [
    {
      id: 'STARTER',
      nombre: 'Plan Starter',
      precio: 0,
      periodo: 'Gratis para siempre',
      color: 'slate',
      icono: Sparkles,
      descripcion: 'Ideal para personas naturales o tiendas que están comenzando.',
      comision: '10% de comisión por venta',
      beneficios: [
        'Hasta 10 productos en catálogo',
        'Vitrina básica de tienda',
        'Soporte estándar vía tickets',
        'Acceso al chat directo con compradores'
      ],
      destacado: false,
    },
    {
      id: 'PRO',
      nombre: 'Plan Profesional',
      precio: 49000,
      periodo: 'COP / mes',
      color: 'indigo',
      icono: Zap,
      descripcion: 'Para negocios en crecimiento que buscan mayor visibilidad y menos comisiones.',
      comision: 'Solo 5% de comisión por venta',
      beneficios: [
        'Hasta 50 productos en catálogo',
        'Insignia Verificado Mercatto',
        'Comisión reducida al 5%',
        'Prioridad media en catálogo y búsquedas',
        'Soporte prioritario 24/7'
      ],
      destacado: true,
    },
    {
      id: 'ELITE',
      nombre: 'Plan Elite Premium',
      precio: 99000,
      periodo: 'COP / mes',
      color: 'amber',
      icono: Crown,
      descripcion: 'Para marcas y distribuidores oficiales que exigen máxima facturación.',
      comision: 'Solo 2% de comisión por venta',
      beneficios: [
        'Productos ilimitados sin restricciones',
        'Insignia dorada ELITE oficial',
        'Comisión mínima del 2%',
        'Aparición prioritaria en el Directorio',
        'Acceso preferencial en el buscador',
        'Asesor comercial de cuenta dedicado'
      ],
      destacado: false,
    }
  ]

  const handleCambiarPlan = async (planId) => {
    if (planId === perfil?.tipoSuscripcion) {
      onClose()
      return
    }

    setProcesando(true)
    try {
      await vendedorService.actualizarSuscripcion(planId)
      success(`¡Membresía actualizada con éxito al ${planId}!`)
      if (onActualizado) onActualizado()
      onClose()
    } catch (err) {
      error(err.response?.data?.mensaje || 'Error al procesar el cambio de membresía')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Encabezado */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-300/30">
              <Sparkles size={14} />
              <span>Monetización & Membresías de Tienda</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Elige el Plan para potenciar tus Ventas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Elige el nivel de suscripción que mejor se adapte a tu catálogo. El dinero de tu suscripción te da acceso a menores comisiones por venta y máxima exposición frente a miles de compradores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-xl font-bold p-2"
          >
            ✕
          </button>
        </div>

        {/* Tarjetas de Planes */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {planes.map((p) => {
            const Icono = p.icono
            const esPlanActual = perfil?.tipoSuscripcion === p.id

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                  p.destacado
                    ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/30 ring-2 ring-indigo-500 shadow-xl -translate-y-1'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                {p.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
                    Más Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      p.id === 'ELITE'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60'
                        : p.id === 'PRO'
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }`}>
                      <Icono size={20} />
                    </div>

                    {esPlanActual && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-[10px] uppercase">
                        Plan Activo
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {p.nombre}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                      {p.descripcion}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {p.precio === 0 ? 'Gratis' : formatCurrency(p.precio)}
                      </span>
                      {p.precio > 0 && (
                        <span className="text-xs text-slate-400 font-semibold">/{p.periodo}</span>
                      )}
                    </div>
                    <span className="inline-block mt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {p.comision}
                    </span>
                  </div>

                  {/* Beneficios */}
                  <ul className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {p.beneficios.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botón de Selección */}
                <div className="pt-6">
                  <button
                    onClick={() => handleCambiarPlan(p.id)}
                    disabled={procesando || esPlanActual}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      esPlanActual
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                        : p.destacado
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    <span>{esPlanActual ? 'Tu Plan Actual' : `Elegir ${p.id}`}</span>
                    {!esPlanActual && <ArrowRight size={13} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Informativo */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>El pago mensual de suscripción se acredita de forma directa al Administrador del Marketplace.</span>
          <button onClick={onClose} className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default VendorMembershipModal
