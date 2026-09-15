import React, { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import AdminStats from '../components/admin/AdminStats'
import VendorsTable from '../components/admin/VendorsTable'
import CategoryManager from '../components/admin/CategoryManager'
import CouponManager from '../components/admin/CouponManager'
import Spinner from '../components/common/Spinner'
import { useToast } from '../hooks/useToast'
import { Shield, Store, Users, Grid, Tag } from 'lucide-react'

export const PanelAdmin = () => {
  const [tab, setTab] = useState('vendedores')
  const [stats, setStats] = useState({})
  const [vendedores, setVendedores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: mostrarError } = useToast()

  const cargarDatos = async () => {
    setLoading(true)

    // allSettled: si /stats falla, igual queremos ver la tabla de vendedores (y viceversa).
    const [stRes, vendsRes, usrsRes] = await Promise.allSettled([
      adminService.obtenerEstadisticas(),
      adminService.listarVendedores({ tamano: 500 }),
      adminService.listarUsuarios({ tamano: 500 }),
    ])

    if (stRes.status === 'fulfilled') {
      setStats(stRes.value || {})
    } else {
      console.error('Error cargando estadísticas del admin:', stRes.reason)
    }

    if (vendsRes.status === 'fulfilled') {
      setVendedores(vendsRes.value?.content || [])
    } else {
      console.error('Error cargando vendedores:', vendsRes.reason)
      mostrarError(
        vendsRes.reason?.response?.data?.mensaje ||
          `No se pudieron cargar los vendedores (${vendsRes.reason?.response?.status || 'error de red'})`
      )
    }

    if (usrsRes.status === 'fulfilled') {
      setUsuarios(usrsRes.value?.content || [])
    } else {
      console.error('Error cargando usuarios:', usrsRes.reason)
    }

    setLoading(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (loading) {
    return <Spinner size="lg" className="py-24" />
  }

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md">
          <Shield size={28} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
            Super Administrador
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
            Panel de Control Global Mercatto
          </h1>
          <p className="text-xs text-slate-400">Supervisa tiendas, comisiones, categorías y usuarios de la plataforma.</p>
        </div>
      </div>

      {/* Global Analytics */}
      <AdminStats stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'vendedores', label: `Proveedores & Tiendas (${vendedores.length})`, icon: Store },
          { id: 'categorias', label: 'Categorías', icon: Grid },
          { id: 'cupones', label: 'Cupones de Descuento', icon: Tag },
          { id: 'usuarios', label: `Usuarios Registrados (${usuarios.length})`, icon: Users },
        ].map((t) => {
          const Icon = t.icon
          const activo = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activo
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Vendors moderation */}
      {tab === 'vendedores' && (
        <VendorsTable vendedores={vendedores} onActualizado={cargarDatos} />
      )}

      {/* Tab 2: Categories */}
      {tab === 'categorias' && <CategoryManager />}

      {/* Tab 3: Coupons */}
      {tab === 'cupones' && <CouponManager />}

      {/* Tab 4: Users list */}
      {tab === 'usuarios' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{u.nombre}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="p-3.5 font-semibold text-indigo-600">{u.rol}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CO') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelAdmin