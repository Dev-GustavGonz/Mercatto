import React, { useEffect, useState } from 'react'
import adminService from '../../services/adminService'
import Spinner from '../common/Spinner'
import Modal from '../common/Modal'
import { useToast } from '../../hooks/useToast'
import {
  Headphones,
  Mail,
  Phone,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  Send,
  Calendar,
  ExternalLink
} from 'lucide-react'

export const SupportTicketsManager = () => {
  const [tickets, setTickets] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [busqueda, setBusqueda] = useState('')
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null)
  const [respuestaTexto, setRespuestaTexto] = useState('')
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false)
  const { error: mostrarError, success: mostrarExito } = useToast()

  const cargarTickets = async () => {
    setCargando(true)
    try {
      const params = { tamano: 100 }
      if (filtroEstado !== 'TODOS') {
        params.estado = filtroEstado
      }
      const data = await adminService.listarTicketsSoporte(params)
      setTickets(data?.content || [])
    } catch (err) {
      console.error('Error cargando tickets:', err)
      mostrarError('No se pudieron cargar los tickets de soporte')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTickets()
  }, [filtroEstado])

  const handleResponder = async (e) => {
    e.preventDefault()
    if (!ticketSeleccionado || !respuestaTexto.trim()) return

    setEnviandoRespuesta(true)
    try {
      const ticketActualizado = await adminService.responderTicketSoporte(ticketSeleccionado.id, {
        respuesta: respuestaTexto.trim(),
        estado: 'RESUELTO'
      })
      mostrarExito(`Respuesta enviada a ${ticketSeleccionado.email}`)
      setTicketSeleccionado(ticketActualizado)
      setRespuestaTexto('')
      cargarTickets()
    } catch (err) {
      console.error('Error respondiendo ticket:', err)
      mostrarError(err.response?.data?.message || 'Error al responder el ticket')
    } finally {
      setEnviandoRespuesta(false)
    }
  }

  const handleCambiarEstado = async (ticketId, nuevoEstado) => {
    try {
      await adminService.responderTicketSoporte(ticketId, {
        estado: nuevoEstado
      })
      mostrarExito(`Ticket actualizado a ${nuevoEstado}`)
      cargarTickets()
      if (ticketSeleccionado && ticketSeleccionado.id === ticketId) {
        setTicketSeleccionado(prev => ({ ...prev, estado: nuevoEstado }))
      }
    } catch (err) {
      mostrarError('Error al cambiar estado')
    }
  }

  const ticketsFiltrados = tickets.filter(t => {
    const q = busqueda.toLowerCase()
    return (
      t.nombre?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.mensaje?.toLowerCase().includes(q) ||
      t.asunto?.toLowerCase().includes(q)
    )
  })

  const pendientesCount = tickets.filter(t => t.estado === 'PENDIENTE').length

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white shadow-xl border border-indigo-900/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Headphones size={13} />
            <span>Mesa de Ayuda & Atención al Cliente</span>
          </div>
          <h3 className="text-xl font-black">Tickets de Soporte de Visitantes</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Gestiona y responde las consultas dejadas por usuarios y visitantes en el Asistente del Home. Cada respuesta se envía automáticamente al correo del interesado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
            <span className="block text-2xl font-black text-amber-400">{pendientesCount}</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Pendientes</span>
          </div>
          <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
            <span className="block text-2xl font-black text-white">{tickets.length}</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Total Tickets</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o contenido del mensaje..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-300"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="EN_GESTION">En Gestión</option>
            <option value="RESUELTO">Resueltos</option>
          </select>
        </div>
      </div>

      {/* Lista de Tickets */}
      {cargando ? (
        <Spinner size="lg" className="py-20" />
      ) : ticketsFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto">
            <CheckCircle size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bandeja de soporte al día</h4>
          <p className="text-xs text-slate-400">No se encontraron tickets con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {ticketsFiltrados.map((ticket) => {
            const esPendiente = ticket.estado === 'PENDIENTE'
            const esResuelto = ticket.estado === 'RESUELTO'
            return (
              <div
                key={ticket.id}
                onClick={() => setTicketSeleccionado(ticket)}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  esPendiente
                    ? 'border-amber-300/80 dark:border-amber-900/60 bg-amber-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User size={13} className="text-indigo-600" />
                      {ticket.nombre}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({ticket.email})</span>
                    {ticket.telefono && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone size={11} />
                        {ticket.telefono}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        esPendiente
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : esResuelto
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400'
                      }`}
                    >
                      {ticket.estado}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {ticket.asunto || 'Consulta General'}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 italic">
                    "{ticket.mensaje}"
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {ticket.fechaCreacion ? new Date(ticket.fechaCreacion).toLocaleString() : 'Reciente'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTicketSeleccionado(ticket)
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} />
                    <span>Gestionar</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Detalle y Respuesta del Ticket */}
      {ticketSeleccionado && (
        <Modal
          isOpen={!!ticketSeleccionado}
          onClose={() => {
            setTicketSeleccionado(null)
            setRespuestaTexto('')
          }}
          title={`Ticket #${ticketSeleccionado.id} - ${ticketSeleccionado.nombre}`}
        >
          <div className="space-y-4 text-xs">
            {/* Metadatos del remitente */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Remitente</span>
                  <span className="font-bold text-slate-800 dark:text-white">{ticketSeleccionado.nombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Correo Electrónico</span>
                  <a href={`mailto:${ticketSeleccionado.email}`} className="text-indigo-600 font-bold hover:underline">
                    {ticketSeleccionado.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono / WhatsApp</span>
                  <span>{ticketSeleccionado.telefono || 'No registrado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado</span>
                  <span className="font-bold text-indigo-600">{ticketSeleccionado.estado}</span>
                </div>
              </div>
            </div>

            {/* Mensaje original */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Consulta del Visitante:
              </span>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {ticketSeleccionado.mensaje}
              </div>
            </div>

            {/* Respuesta previa si existe */}
            {ticketSeleccionado.respuestaAdmin && (
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                  Respuesta enviada anteriormente:
                </span>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-line">
                  {ticketSeleccionado.respuestaAdmin}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Respondido el: {new Date(ticketSeleccionado.fechaRespuesta).toLocaleString()}
                </span>
              </div>
            )}

            {/* Formulario de Respuesta por Email */}
            <form onSubmit={handleResponder} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Responder al visitante (Se enviará a {ticketSeleccionado.email}):
              </label>
              <textarea
                rows={3}
                placeholder="Escribe la respuesta formal del equipo Mercatto..."
                value={respuestaTexto}
                onChange={(e) => setRespuestaTexto(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado(ticketSeleccionado.id, 'EN_GESTION')}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    Marcar En Gestión
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado(ticketSeleccionado.id, 'RESUELTO')}
                    className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition border border-emerald-200 dark:border-emerald-800"
                  >
                    Marcar Resuelto
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={enviandoRespuesta || !respuestaTexto.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{enviandoRespuesta ? 'Enviando...' : 'Enviar Respuesta por Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default SupportTicketsManager
