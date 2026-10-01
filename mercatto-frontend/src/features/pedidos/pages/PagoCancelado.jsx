import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ShoppingBag, ArrowLeft } from 'lucide-react'
import Button from '@/components/common/Button'

export const PagoCancelado = () => {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-6 shadow-inner">
        <AlertCircle size={44} />
      </div>

      <span className="inline-block px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold mb-3 border border-rose-200 dark:border-rose-800">
        Pago no completado
      </span>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
        La transacción no se procesó
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        No se ha realizado ningún cobro a tu cuenta. Puedes intentarlo de nuevo o elegir otro medio de pago (como Nequi, PSE o Pago Contra Entrega).
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/checkout">
          <Button variant="primary" className="w-full sm:w-auto">
            <ArrowLeft size={16} className="mr-2" />
            Volver al Checkout
          </Button>
        </Link>
        <Link to="/carrito">
          <Button variant="outline" className="w-full sm:w-auto">
            <ShoppingBag size={16} className="mr-2" />
            Revisar Carrito
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PagoCancelado
