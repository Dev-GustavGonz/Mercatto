import React from 'react'
import { formatCurrency } from '@/utils/formatCurrency'
import { DollarSign, Package, ShoppingCart, Star } from 'lucide-react'

export const VendorStats = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Ingresos Netos (tras 4% admin)',
      value: formatCurrency(stats.ingresosTotales || 0),
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
    },
    {
      title: 'Pedidos Recibidos',
      value: stats.totalPedidos || 0,
      icon: ShoppingCart,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50',
    },
    {
      title: 'Productos Publicados',
      value: stats.totalProductos || 0,
      icon: Package,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50',
    },
    {
      title: 'Calificación de Tienda',
      value: `${(stats.calificacion || 5.0).toFixed(1)} ★`,
      icon: Star,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{c.title}</span>
              <div className={`p-2 rounded-xl ${c.color}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{c.value}</p>
          </div>
        )
      })}
    </div>
  )
}

export default VendorStats
