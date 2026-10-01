import React, { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import Button from '@/components/common/Button'
import { Tag, Check, X } from 'lucide-react'

export const CouponInput = () => {
  const { cupon, aplicarCupon, removerCupon } = useCart()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    const res = await aplicarCupon(codigo.trim().toUpperCase())
    if (res?.exito) setCodigo('')
    setLoading(false)
  }

  if (cupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Cupón activo: {cupon.codigo}
          </span>
        </div>
        <button
          onClick={removerCupon}
          className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <X size={12} />
          <span>Quitar</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Tag size={14} />
        </div>
        <input
          type="text"
          placeholder="Código de cupón (ej: MERCATTO10)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <Button type="submit" size="sm" variant="outline" loading={loading} disabled={!codigo.trim()}>
        Aplicar
      </Button>
    </form>
  )
}

export default CouponInput
