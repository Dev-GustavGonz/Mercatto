import React, { useState } from 'react'
import { adminService } from '@/features/admin'
import Modal from '@/components/common/Modal'
import { useToast } from '@/hooks/useToast'
import { Check, X, ShieldAlert, Search, Eye, Building2, MapPin, Phone, CreditCard } from 'lucide-react'

export const VendorsTable = ({ vendedores = [], onActualizado }) => {
  const { success, error } = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(null)

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

  const vendedoresFiltrados = vendedores.filter((v) => {
    const coincideTexto = !busqueda || 
      v.nombreTienda?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.nombrePropietario?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.nitCedula?.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideEstado = filtroEstado === 'TODOS' || v.estado === filtroEstado
    return coincideTexto && coincideEstado
  })

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar tienda por nombre, dueño, email o NIT..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-rose-500 shadow-sm"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {['TODOS', 'APROBADO', 'PENDIENTE', 'SUSPENDIDO'].map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filtroEstado === est
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Tienda / Propietario</th>
              <th className="p-3.5">NIT / Cédula</th>
              <th className="p-3.5 text-right">Ventas Brutas</th>
              <th className="p-3.5 text-right text-emerald-600 dark:text-emerald-400">Comisión Admin (4%)</th>
              <th className="p-3.5">Ciudad</th>
              <th className="p-3.5">Estado</th>
              <th className="p-3.5 text-right">Acciones de Aprobación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {vendedoresFiltrados.map((v) => {
              const esPendiente = v.estado === 'PENDIENTE'
              const esAprobado = v.estado === 'APROBADO'
              const ventasBrutas = v.ventasBrutas || (v.ingresosTotales ? v.ingresosTotales / 0.96 : 0)
              const comision = v.comisionAdmin || (ventasBrutas * 0.04)

              return (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{v.nombreTienda}</p>
                    <p className="text-[11px] text-slate-400">{v.nombrePropietario} ({v.email})</p>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono">{v.nitCedula || 'N/A'}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(ventasBrutas)}
                  </td>
                  <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                    +{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(comision)}
                  </td>
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
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => setVendedorSeleccionado(v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer transition text-xs"
                      title="Ver expediente comercial y bancario"
                    >
                      <Eye size={13} />
                      <span>Expediente</span>
                    </button>

                    {esPendiente && (
                      <>
                        <button
                          onClick={() => handleCambiarEstado(v.id, 'APROBADO')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition"
                        >
                          <Check size={13} />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(v.id, 'RECHAZADO')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold cursor-pointer transition"
                        >
                          <X size={13} />
                          <span>Rechazar</span>
                        </button>
                      </>
                    )}

                    {esAprobado && (
                      <button
                        onClick={() => handleCambiarEstado(v.id, 'SUSPENDIDO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold cursor-pointer transition"
                      >
                        <ShieldAlert size={13} />
                        <span>Suspender</span>
                      </button>
                    )}

                    {v.estado === 'SUSPENDIDO' && (
                      <button
                        onClick={() => handleCambiarEstado(v.id, 'APROBADO')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 cursor-pointer transition"
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

    {/* Modal de Expediente del Proveedor */}
    {vendedorSeleccionado && (
      <Modal
        isOpen={true}
        onClose={() => setVendedorSeleccionado(null)}
        title={`Expediente: ${vendedorSeleccionado.nombreTienda}`}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {vendedorSeleccionado.logoUrl ? (
                <img src={vendedorSeleccionado.logoUrl} alt={vendedorSeleccionado.nombreTienda} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={24} />
              )}
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">{vendedorSeleccionado.nombreTienda}</h4>
              <p className="text-[11px] text-slate-400">Tipo: {vendedorSeleccionado.tipo} • Estado: {vendedorSeleccionado.estado}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Propietario / Representante</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{vendedorSeleccionado.nombrePropietario || 'No registrado'}</p>
              <p className="text-slate-500">{vendedorSeleccionado.email}</p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Identificación Fiscal</span>
              <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{vendedorSeleccionado.nitCedula || 'Sin NIT/Cédula'}</p>
              <p className="text-slate-500">{vendedorSeleccionado.razonSocial || 'Persona Natural'}</p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ubicación y Despacho</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <MapPin size={12} className="text-rose-500" />
                <span>{vendedorSeleccionado.ciudad || 'Colombia'}</span>
              </p>
              <p className="text-slate-500 truncate">{vendedorSeleccionado.direccion || 'Dirección de bodega no provista'}</p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Información Bancaria</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <CreditCard size={12} className="text-emerald-500" />
                <span>{vendedorSeleccionado.banco || 'Banco por definir'}</span>
              </p>
              <p className="text-slate-500 font-mono">{vendedorSeleccionado.cuentaBancaria || 'No suministrada'}</p>
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent dark:bg-slate-800 rounded-2xl border border-emerald-500/30 space-y-2">
            <span className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 block tracking-wider">
              Balance Comercial & Liquidación (Comisión 4%)
            </span>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <span className="text-[10px] text-slate-400 block">Ventas Brutas:</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(vendedorSeleccionado.ventasBrutas || (vendedorSeleccionado.ingresosTotales ? vendedorSeleccionado.ingresosTotales / 0.96 : 0))}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">Tu Ganancia (4%):</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  +{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(vendedorSeleccionado.comisionAdmin || ((vendedorSeleccionado.ventasBrutas || (vendedorSeleccionado.ingresosTotales ? vendedorSeleccionado.ingresosTotales / 0.96 : 0)) * 0.04))}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">Neto para la Tienda (96%):</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(vendedorSeleccionado.pagoNetoVendedor || ((vendedorSeleccionado.ventasBrutas || (vendedorSeleccionado.ingresosTotales ? vendedorSeleccionado.ingresosTotales / 0.96 : 0)) * 0.96))}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Descripción de la Marca</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{vendedorSeleccionado.descripcion || 'Sin descripción comercial suministrada.'}"
            </p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              Registrado el: {vendedorSeleccionado.fechaRegistro ? new Date(vendedorSeleccionado.fechaRegistro).toLocaleDateString() : '-'}
            </span>
            <button
              onClick={() => setVendedorSeleccionado(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      </Modal>
    )}
  </div>
  )
}

export default VendorsTable
