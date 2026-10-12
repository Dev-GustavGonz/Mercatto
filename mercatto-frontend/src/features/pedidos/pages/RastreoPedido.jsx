import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pedidoService from '../services/pedidoService'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Spinner from '@/components/common/Spinner'
import { formatCurrency } from '@/utils/formatCurrency'
import { ESTADOS_PEDIDO } from '@/utils/constants'
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  MessageSquare, 
  AlertCircle,
  ShieldCheck,
  Calendar
} from 'lucide-react'

export const RastreoPedido = () => {
  const [searchParams] = useSearchParams()
  const [codigo, setCodigo] = useState(searchParams.get('codigo') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [loading, setLoading] = useState(false)
  const [pedido, setPedido] = useState(null)
  const { error: toastError, success: toastSuccess } = useToast()

  const handleBuscar = async (e) => {
    e.preventDefault()
    if (!codigo.trim()) {
      toastError('Por favor ingresa el código de tu pedido (ejemplo: ORD-...)')
      return
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      toastError('Por favor ingresa un correo electrónico válido')
      return
    }

    setLoading(true)
    setPedido(null)
    try {
      const res = await pedidoService.rastrearPedido(codigo.trim(), email.trim())
      setPedido(res)
      toastSuccess('¡Pedido encontrado con éxito!')
    } catch (err) {
      toastError(err.response?.data?.mensaje || err.response?.data?.message || 'No se encontró ningún pedido con esos datos. Por favor verifica el código y el correo.')
    } finally {
      setLoading(false)
    }
  }

  // Pasos de la línea de tiempo
  const pasos = [
    { id: 'PENDIENTE', label: 'Orden Creada', icon: Clock },
    { id: 'PAGADO', label: 'Pago Aprobado', icon: ShieldCheck },
    { id: 'EN_PREPARACION', label: 'Empacando', icon: Package },
    { id: 'ENVIADO', label: 'En Camino', icon: Truck },
    { id: 'ENTREGADO', label: 'Entregado', icon: CheckCircle2 },
  ]

  const getPasoActualIndex = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 0
      case 'PAGADO': return 1
      case 'EN_PREPARACION': return 2
      case 'ENVIADO': return 3
      case 'ENTREGADO': return 4
      default: return 0
    }
  }

  const indexActual = pedido ? getPasoActualIndex(pedido.estado) : 0

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-black uppercase tracking-wider">
          <Truck size={14} />
          <span>Rastreo Oficial Mercatto</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Consulta el Estado de tu Paquete
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Ingresa el código de pedido recibido en tu pantalla de confirmación o correo electrónico para ver el seguimiento en tiempo real.
        </p>
      </div>

      {/* Formulario de Consulta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-violet-500/5">
        <form onSubmit={handleBuscar} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Código de Pedido"
              placeholder="Ej. ORD-20261012-XXXX"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-5">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black h-[46px] rounded-2xl flex items-center justify-center gap-2"
              loading={loading}
            >
              <Search size={18} />
              <span>Rastrear</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Resultado de la Búsqueda */}
      {pedido && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 animate-in fade-in duration-300">
          {/* Header del Pedido */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">PEDIDO</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{pedido.codigo}</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Calendar size={13} />
                <span>Fecha de Compra: {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleDateString('es-CO', { dateStyle: 'long' }) : 'Reciente'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                pedido.estado === 'ENTREGADO'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : pedido.estado === 'CANCELADO'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-violet-50 text-violet-700 border border-violet-200'
              }`}>
                {ESTADOS_PEDIDO[pedido.estado]?.label || pedido.estado}
              </span>
            </div>
          </div>

          {/* Línea de Tiempo Visual */}
          {pedido.estado !== 'CANCELADO' && (
            <div className="py-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">
                Progreso del Envío
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                {pasos.map((paso, idx) => {
                  const Icon = paso.icon
                  const completado = idx <= indexActual
                  const activo = idx === indexActual
                  return (
                    <div 
                      key={paso.id}
                      className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                        activo
                          ? 'border-violet-600 bg-violet-50/70 text-violet-700 ring-2 ring-violet-500 shadow-sm'
                          : completado
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                          : 'border-slate-100 bg-slate-50/50 text-slate-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        activo ? 'bg-violet-600 text-white' : completado ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-black leading-tight">{paso.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Datos de Transporte si está en camino */}
          {(pedido.guiaSeguimiento || pedido.empresaEnvio) && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <Truck className="text-violet-600 shrink-0" size={24} />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Empresa Transportadora</h4>
                  <p className="text-sm font-bold text-violet-700">{pedido.empresaEnvio || 'Coordinadora / Servientrega'}</p>
                </div>
              </div>
              {pedido.guiaSeguimiento && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-bold block">NÚMERO DE GUÍA</span>
                  <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 inline-block">
                    {pedido.guiaSeguimiento}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Lista de Productos Comprados */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Artículos en este paquete ({pedido.items?.length || 0})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pedido.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {item.imagenUrl ? (
                        <img src={item.imagenUrl} alt={item.nombreProducto} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {item.nombreProducto}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Cantidad: {item.cantidad} {item.nombreVariante ? `• Variante: ${item.nombreVariante}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose Financiero */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Dirección de Entrega:</span>
              <span>{pedido.direccion?.direccion || 'Registrada en pedido'}, {pedido.direccion?.ciudad || 'Colombia'}</span>
            </div>
            <div className="text-right space-y-1 w-full sm:w-auto">
              <div className="text-xs text-slate-500 flex justify-between sm:justify-end gap-6">
                <span>Total Cancelado:</span>
                <span className="font-black text-slate-900 dark:text-white text-base">
                  {formatCurrency(pedido.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regreso y Asistencia */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700 transition">
          <ArrowLeft size={16} />
          <span>Volver al inicio de Mercatto</span>
        </Link>
        <a 
          href={`https://wa.me/573233882717?text=${encodeURIComponent('Hola Mercatto, necesito ayuda con mi pedido ' + codigo)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
        >
          <MessageSquare size={16} className="text-emerald-500" />
          <span>¿Dudas con tu paquete? Contáctanos por WhatsApp</span>
        </a>
      </div>
    </div>
  )
}

export default RastreoPedido
