import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Package, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'
import Button from '@/components/common/Button'

export const OrderSuccess = ({ pedido }) => {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-inner">
        <CheckCircle2 size={48} />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        ¡Pago y Pedido Confirmado!
      </span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 mb-3">
        Gracias por tu compra en Mercatto
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Hemos recibido tu pedido y los proveedores han sido notificados para comenzar el despacho.
      </p>

      {/* Order Box */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-4 mb-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs text-slate-400 font-medium">Código de seguimiento:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{pedido.codigo}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            {pedido.estado}
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span>Total cancelado:</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(pedido.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Método de pago:</span>
            <span className="font-semibold">{pedido.metodoPago || 'Tarjeta de Crédito / Débito'}</span>
          </div>
          {pedido.direccion && (
            <div className="flex justify-between">
              <span>Entrega en:</span>
              <span className="font-medium text-right">{pedido.direccion.direccion}, {pedido.direccion.ciudad}</span>
            </div>
          )}
        </div>
      </div>

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

export default OrderSuccess
