import React from 'react'
import adminService from '../../services/adminService'
import { useToast } from '../../hooks/useToast'
import { Check, X, ShieldAlert } from 'lucide-react'

export const VendorsTable = ({ vendedores = [], onActualizado }) => {
  const { success, error } = useToast()

  const handleCambiarEstado = async (id, estado) => {
    try {
      await adminService.cambiarEstadoVendedor(id, estado)
      success(`Tienda actualizada a estado: ${estado}`)
      if (onActualizado) onActualizado()
    } catch (err) {
      console.error('Error cambiando estado del vendedor:', err)
      error(err?.response?.data?.mensaje || 'No se pudo actualizar el estado')
    }
  }

  if (vendedores.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
        No se encontraron vendedores registrados.
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Tienda / Propietario</th>
              <th className="p-3.5">NIT / Cédula</th>
              <th className="p-3.5">Ciudad</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 text-right">Acciones de Aprobación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {vendedores.map((v) => {
              const esPendiente = v.estado === 'PENDIENTE'
              const esAprobado = v.estado === 'APROBADO'

              return (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{v.nombreTienda}</p>
                    <p className="text-[11px] text-slate-400">{v.nombrePropietario} ({v.email})</p>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono">{v.nitCedula || 'N/A'}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{v.ciudad || 'No especificada'}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        esAprobado
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : esPendiente
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      }`}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {esPendiente && (
                      <>
                        <button
                          onClick={() => handleCambiarEstado(v.id, 'APROBADO')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(v.id, 'RECHAZADO')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold cursor-pointer"
                        >
                          <X size={13} />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}

                    {esAprobado && (
                      <button
                        onClick={() => handleCambiarEstado(v.id, 'SUSPENDIDO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium cursor-pointer"
                      >
                        <ShieldAlert size={13} />
                        <span>Suspender</span>
                      </button>
                    )}

                    {v.estado === 'SUSPENDIDO' && (
                      <button
                        onClick={() => handleCambiarEstado(v.id, 'APROBADO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 cursor-pointer"
                      >
                        <Check size={13} />
                        <span>Reactivar</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VendorsTable