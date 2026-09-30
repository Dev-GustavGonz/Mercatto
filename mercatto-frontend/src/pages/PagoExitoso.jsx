import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../components/common/Button'

export const PagoExitoso = () => {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref') || searchParams.get('id')

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-inner animate-bounce">
        <CheckCircle2 size={44} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200 dark:border-emerald-800">
        <ShieldCheck size={14} />
        <span>Pago Aprobado y Confirmado</span>
      </div>

      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
        ¡Tu transacción fue exitosa!
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Hemos registrado tu pago de forma segura. El vendedor ya fue notificado y está preparando el despacho de tus productos.
      </p>

      {ref && (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 inline-block text-left text-xs">
          <span className="text-slate-400 block font-medium">Referencia de transacción:</span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ref}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/mis-pedidos">
          <Button variant="outline" className="w-full sm:w-auto">
            <Package size={16} className="mr-2" />
            Ver Mis Pedidos
          </Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="primary" className="w-full sm:w-auto">
            <span>Seguir Comprando</span>
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PagoExitoso
