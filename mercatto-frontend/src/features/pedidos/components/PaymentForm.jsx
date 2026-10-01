import React from 'react'
import { METODOS_PAGO } from '@/utils/constants'
import { CreditCard, Building, Smartphone, Truck, CheckCircle, ShieldCheck } from 'lucide-react'

export const PaymentForm = ({ metodoSeleccionado, onSelectMetodo }) => {
  const getIcon = (id) => {
    switch (id) {
      case 'WOMPI':
        return <CreditCard className="text-indigo-600" size={20} />
      case 'NEQUI':
        return <Smartphone className="text-purple-600" size={20} />
      case 'PSE':
        return <Building className="text-emerald-600" size={20} />
      case 'CONTRA_ENTREGA':
        return <Truck className="text-amber-600" size={20} />
      default:
        return <CreditCard size={20} />
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {METODOS_PAGO.map((m) => {
          const isSelected = metodoSeleccionado === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMetodo(m.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {getIcon(m.id)}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.nombre}</span>
                </div>
                {isSelected && <CheckCircle size={16} className="text-indigo-600 shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {metodoSeleccionado === 'WOMPI' && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300">
            <ShieldCheck size={16} className="text-indigo-600" />
            <span>Pago Seguro En Línea con Tarjeta de Crédito o Débito</span>
          </div>
          <p className="text-indigo-800 dark:text-indigo-300 leading-relaxed">
            Aceptamos Visa, MasterCard y American Express. Tus datos están protegidos con cifrado bancario de 256 bits y procesados de manera segura e instantánea.
          </p>
        </div>
      )}

      {metodoSeleccionado === 'NEQUI' && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-2">
          <p className="font-bold text-purple-900 dark:text-purple-300">
            Transferencia Directa Nequi / Daviplata
          </p>
          <p className="text-purple-700 dark:text-purple-400">
            Se generará una referencia de pago vinculada a tu pedido para transferir desde tu celular o escanear el código QR.
          </p>
        </div>
      )}

      {metodoSeleccionado === 'PSE' && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
          <p className="font-bold text-emerald-900 dark:text-emerald-300">
            Débito Bancario PSE
          </p>
          <p className="text-emerald-700 dark:text-emerald-400">
            Conexión con cualquier entidad financiera colombiana para débito en línea de tu cuenta de ahorros o corriente.
          </p>
        </div>
      )}

      {metodoSeleccionado === 'CONTRA_ENTREGA' && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-2">
          <p className="font-bold text-amber-900 dark:text-amber-300">
            Pago Contra Entrega (Efectivo)
          </p>
          <p className="text-amber-700 dark:text-amber-400">
            Pagas el valor total de tu orden en efectivo directamente a la transportadora cuando el paquete llegue a tu puerta.
          </p>
        </div>
      )}
    </div>
  )
}

export default PaymentForm
