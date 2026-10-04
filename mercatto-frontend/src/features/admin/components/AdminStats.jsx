import React from 'react'
import { formatCurrency } from '@/utils/formatCurrency'
import { Users, Store, DollarSign, Package, AlertCircle } from 'lucide-react'

export const AdminStats = ({ stats = {} }) => {
  const cards = [
    {
      title: 'Ventas Totales Plataforma',
      value: formatCurrency(stats.ingresosTotales || 0),
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
    },
    {
      title: 'Comisiones Plataforma (4%)',
      value: formatCurrency((stats.ingresosTotales || 0) * 0.04),
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50',
    },
    {
      title: 'Total Usuarios Registrados',
      value: stats.totalUsuarios || 0,
      icon: Users,
      color: 'text-sky-600 bg-sky-100 dark:bg-sky-950/50',
    },
    {
      title: 'Vendedores Aprobados',
      value: stats.totalVendedores || 0,
      icon: Store,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50',
    },
    {
      title: 'Tiendas Pendientes de Aprobación',
      value: stats.totalVendedoresPendientes || 0,
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-950/50',
    },
    {
      title: 'Total Productos Activos',
      value: stats.totalProductos || 0,
      icon: Package,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
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

export default AdminStats
