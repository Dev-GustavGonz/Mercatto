import React from 'react'

export const ProductVariants = ({ variantes = [], varianteSeleccionada, onSelectVariante }) => {
  if (!variantes || variantes.length === 0) return null

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Opciones disponibles:
      </label>
      <div className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const isSelected = varianteSeleccionada?.id === v.id
          const sinStock = v.stock <= 0

          return (
            <button
              key={v.id}
              onClick={() => !sinStock && onSelectVariante(v)}
              disabled={sinStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500'
                  : sinStock
                  ? 'border-slate-200 text-slate-400 bg-slate-100 dark:bg-slate-800 line-through cursor-not-allowed opacity-60'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900'
              }`}
            >
              <span>{v.nombre}</span>
              {v.stock <= 5 && v.stock > 0 && (
                <span className="ml-1.5 text-[10px] text-amber-600 font-bold">
                  (¡Últimas {v.stock}!)
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ProductVariants
