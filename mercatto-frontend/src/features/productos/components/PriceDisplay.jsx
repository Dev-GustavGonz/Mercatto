import React from 'react'
import { formatCurrency } from '@/utils/formatCurrency'

export const PriceDisplay = ({ precio, precioOferta, size = 'md' }) => {
  const tieneOferta = precioOferta && precioOferta < precio

  const sizes = {
    sm: { main: 'text-sm font-bold', old: 'text-xs', badge: 'text-[10px]' },
    md: { main: 'text-lg font-bold', old: 'text-xs', badge: 'text-xs' },
    lg: { main: 'text-2xl sm:text-3xl font-extrabold', old: 'text-sm', badge: 'text-xs' },
  }

  const currentSize = sizes[size] || sizes.md

  const porcentajeDescuento = tieneOferta
    ? Math.round(((precio - precioOferta) / precio) * 100)
    : 0

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`${currentSize.main} text-slate-900 dark:text-white`}>
        {formatCurrency(tieneOferta ? precioOferta : precio)}
      </span>

      {tieneOferta && (
        <>
          <span className={`${currentSize.old} text-slate-400 line-through font-normal`}>
            {formatCurrency(precio)}
          </span>
          <span
            className={`${currentSize.badge} font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded`}
          >
            -{porcentajeDescuento}% OFF
          </span>
        </>
      )}
    </div>
  )
}

export default PriceDisplay
