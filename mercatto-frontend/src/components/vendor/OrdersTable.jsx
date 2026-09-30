import React, { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { ESTADOS_PEDIDO } from '../../utils/constants'
import Button from '../common/Button'
import Modal from '../common/Modal'
import Input from '../common/Input'
import pedidoService from '../../services/pedidoService'
import { useToast } from '../../hooks/useToast'
import { Eye, Truck, Search, Filter, Clock, CheckCircle2, PackageCheck } from 'lucide-react'

export const OrdersTable = ({ pedidos = [], onPedidoActualizado }) => {
  const [pedidoDetalle, setPedidoDetalle] = useState(null)
  const [modalEnvio, setModalEnvio] = useState(null)
  const [guia, setGuia] = useState('')
  const [empresa, setEmpresa] = useState('Servientrega')
  const [loading, setLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const { success, error } = useToast()

  const handleActualizarEstado = async (id, estado, tracking = null, carrier = null) => {
    try {
      await pedidoService.actualizarEstado(id, { estado, guia: tracking, empresa: carrier })
      success('Estado del pedido actualizado')
      if (onPedidoActualizado) onPedidoActualizado()
    } catch {
      error('Error al actualizar estado')
    }
  }

  const handleEnviarPedido = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await handleActualizarEstado(modalEnvio.id, 'ENVIADO', guia, empresa)
      setModalEnvio(null)
      setGuia('')
    } finally {
      setLoading(false)
    }
  }

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideEstado =
      filtroEstado === 'TODOS' ||
      (filtroEstado === 'PENDIENTES' && (p.estado === 'PAGADO' || p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION')) ||
      p.estado === filtroEstado

    const q = busqueda.toLowerCase().trim()
    const coincideBusqueda =
      !q ||
      p.codigo?.toLowerCase().includes(q) ||
      p.comprador?.nombre?.toLowerCase().includes(q) ||
      p.direccion?.ciudad?.toLowerCase().includes(q)

    return coincideEstado && coincideBusqueda
  })

  return (
    <div className="space-y-4">
      {/* Controles de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Pestañas de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'TODOS', label: 'Todos', count: pedidos.length },
            { id: 'PENDIENTES', label: 'Por Despachar', count: pedidos.filter(p => p.estado === 'PAGADO' || p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION').length },
            { id: 'ENVIADO', label: 'En Camino', count: pedidos.filter(p => p.estado === 'ENVIADO').length },
            { id: 'ENTREGADO', label: 'Entregados', count: pedidos.filter(p => p.estado === 'ENTREGADO').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                filtroEstado === tab.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filtroEstado === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="relative max-w-xs w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o cliente..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No se encontraron pedidos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((p) => {
                  const infoEstado = ESTADOS_PEDIDO[p.estado] || { label: p.estado, color: 'gray' }
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.codigo}</td>
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{p.comprador?.nombre}</p>
                        <p className="text-[11px] text-slate-400">{p.direccion?.ciudad}</p>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{formatCurrency(p.total)}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          {infoEstado.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString('es-CO') : '-'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setPedidoDetalle(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Ver Detalles"
                        >
                          <Eye size={15} />
                        </button>

                        {(p.estado === 'PAGADO' || p.estado === 'PENDIENTE') && (
                          <button
                            onClick={() => handleActualizarEstado(p.id, 'EN_PREPARACION')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 cursor-pointer transition shadow-xs"
                          >
                            Preparar Pedido
                          </button>
                        )}

                        {p.estado === 'EN_PREPARACION' && (
                          <button
                            onClick={() => setModalEnvio(p)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-[11px] font-bold hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 cursor-pointer transition shadow-xs flex items-center gap-1 inline-flex"
                          >
                            <Truck size={12} />
                            <span>Despachar / Guía</span>
                          </button>
                        )}

                        {p.estado === 'ENVIADO' && (
                          <button
                            onClick={() => handleActualizarEstado(p.id, 'ENTREGADO')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer transition shadow-xs flex items-center gap-1 inline-flex"
                          >
                            <CheckCircle2 size={12} />
                            <span>Confirmar Entrega</span>
                          </button>
                        )}

                        {p.estado === 'ENTREGADO' && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Completado</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle Pedido */}
      {pedidoDetalle && (
        <Modal isOpen={true} onClose={() => setPedidoDetalle(null)} title={`Detalles de Pedido: ${pedidoDetalle.codigo}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p className="font-bold text-slate-800 dark:text-white">Dirección de Envío:</p>
              <p className="text-slate-600 dark:text-slate-300">
                {pedidoDetalle.direccion?.nombreCompleto} — Tel: {pedidoDetalle.direccion?.telefono}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {pedidoDetalle.direccion?.direccion}, {pedidoDetalle.direccion?.ciudad}, {pedidoDetalle.direccion?.departamento}
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pedidoDetalle.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 items-center">
                  <div className="flex items-center gap-2">
                    <img src={item.imagenUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'} className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{item.nombreProducto}</p>
                      {item.nombreVariante && <p className="text-[10px] text-slate-400">{item.nombreVariante}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.cantidad} x {formatCurrency(item.precioUnitario)}</p>
                    <p className="font-bold text-indigo-600">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-between font-bold text-sm">
              <span>Total Pedido:</span>
              <span className="text-indigo-600">{formatCurrency(pedidoDetalle.total)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Despachar Pedido */}
      {modalEnvio && (
        <Modal isOpen={true} onClose={() => setModalEnvio(null)} title={`Despachar Pedido: ${modalEnvio.codigo}`}>
          <form onSubmit={handleEnviarPedido} className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Destino de Entrega:</span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {modalEnvio.direccion?.nombreCompleto || modalEnvio.comprador?.nombre} — Tel: {modalEnvio.direccion?.telefono || 'N/A'}
              </p>
              <p className="text-slate-500">
                {modalEnvio.direccion?.direccion}, {modalEnvio.direccion?.barrio ? `${modalEnvio.direccion.barrio}, ` : ''}{modalEnvio.direccion?.ciudad}, {modalEnvio.direccion?.departamento}
              </p>
              {modalEnvio.direccion?.notasEntrega && (
                <p className="text-amber-600 dark:text-amber-400 italic text-[11px] pt-1">
                  Nota del cliente: "{modalEnvio.direccion.notasEntrega}"
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Empresa Transportadora
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {['Servientrega', 'Coordinadora', 'Interrapidísimo', 'Envía'].map((trans) => (
                  <button
                    key={trans}
                    type="button"
                    onClick={() => setEmpresa(trans)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      empresa === trans
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {trans}
                  </button>
                ))}
              </div>
              <Input
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="O escribe otra transportadora..."
                required
              />
            </div>

            <Input
              label="Número de Guía o Tracking de Envío"
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              placeholder="Ej: 1092837465"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalEnvio(null)}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={loading}>
                <Truck size={14} className="mr-1.5" />
                <span>Confirmar y Notificar Despacho</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default OrdersTable
