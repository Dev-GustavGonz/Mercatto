import React from 'react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/formatCurrency'
import CouponInput from './CouponInput'
import Button from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Truck } from 'lucide-react'

export const CartSummary = ({ showCheckoutBtn = true, onCheckout }) => {
  const { subtotal, descuento, costoEnvio, total, items, setDrawerAbierto } = useCart()
  const navigate = useNavigate()

  const handleGoToCheckout = () => {
    setDrawerAbierto(false)
    if (onCheckout) {
      onCheckout()
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resumen del Pedido</h3>

      <CouponInput />

      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {descuento > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Descuento cupón</span>
            <span>-{formatCurrency(descuento)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Costo de envío</span>
          <span>{costoEnvio === 0 ? <span className="text-emerald-600 font-bold">¡GRATIS!</span> : formatCurrency(costoEnvio)}</span>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-extrabold text-sm text-slate-900 dark:text-white">
          <span>Total a pagar</span>
          <span className="text-base text-indigo-600 dark:text-indigo-400">{formatCurrency(total)}</span>
        </div>
      </div>

      {showCheckoutBtn && (
        <Button
          variant="primary"
          size="lg"
          className="w-full mt-4"
          disabled={items.length === 0}
          onClick={handleGoToCheckout}
        >
          Proceder al Pago
        </Button>
      )}

      <div className="flex items-center justify-center gap-4 pt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> Pago seguro</span>
        <span className="flex items-center gap-1"><Truck size={14} className="text-indigo-500" /> Envío garantizado</span>
      </div>
    </div>
  )
}

export default CartSummary
