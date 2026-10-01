import React, { useState, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { productoService } from '@/features/productos'
import { MessageSquare, Send, Store, ShieldCheck, Clock } from 'lucide-react'

export const ModalContactoVendedor = ({ isOpen, onClose, producto }) => {
  const { usuario, autenticado } = useAuth()
  const { success, error } = useToast()
  const [mensaje, setMensaje] = useState('')
  const [asunto, setAsunto] = useState('Consulta sobre el producto')
  const [loading, setLoading] = useState(false)
  const [conversacion, setConversacion] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  useEffect(() => {
    if (isOpen && producto && autenticado) {
      setCargandoHistorial(true)
      productoService
        .obtenerConversacion(producto.id)
        .then((data) => {
          setConversacion(data || [])
          setCargandoHistorial(false)
        })
        .catch(() => setCargandoHistorial(false))
    }
  }, [isOpen, producto, autenticado])

  if (!producto) return null

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!mensaje.trim()) return

    setLoading(true)
    try {
      const nuevo = await productoService.enviarMensajeContacto(producto.id, mensaje.trim(), asunto)
      success('Mensaje enviado al proveedor')
      setConversacion((prev) => [...prev, nuevo])
      setMensaje('')
    } catch (err) {
      error(err.response?.data?.mensaje || 'Error al enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chat / Consulta con ${producto.vendedor?.nombreTienda || 'el Proveedor'}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Product mini header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <img
            src={producto.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
            alt={producto.titulo}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{producto.titulo}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-indigo-600">
                <Store size={12} /> {producto.vendedor?.nombreTienda}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck size={12} /> Proveedor Verificado
              </span>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="h-64 overflow-y-auto p-3 rounded-xl bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
          {cargandoHistorial ? (
            <p className="text-xs text-slate-400 text-center py-10">Cargando mensajes...</p>
          ) : conversacion.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-400">
              <MessageSquare size={24} className="mb-2 text-slate-300" />
              <p>Inicia una conversación directa con el vendedor.</p>
              <p className="text-[10px] text-slate-400 mt-1">Resuelve dudas sobre stock, envíos o coordinación de pagos.</p>
            </div>
          ) : (
            conversacion.map((msg, idx) => {
              const esMio = msg.comprador?.id === usuario?.id && msg.esDeComprador
              return (
                <div key={msg.id || idx} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      esMio
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.mensaje}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.esDeComprador ? 'Tú' : producto.vendedor?.nombreTienda}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleEnviar} className="space-y-3">
          <div className="flex gap-2">
            <select
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="Consulta sobre el producto">Consulta de Producto</option>
              <option value="Coordinación de Pago o Envío">Coordinar Pago / Envío</option>
              <option value="Negociación por Mayor / Proveedor">Venta al por mayor</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe tu mensaje o duda para el vendedor..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="flex-1 text-xs p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <Button type="submit" variant="primary" loading={loading} disabled={!mensaje.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ModalContactoVendedor
