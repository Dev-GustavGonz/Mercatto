import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import mensajeService from '../services/mensajeService'
import authService from '../services/authService'
import { Send, Coins, User, Store, Loader2, ArrowLeft } from 'lucide-react'

export const Mensajes = () => {
  const { usuario, setUsuario } = useAuth()
  const { success, error: toastError } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [contactos, setContactos] = useState([])
  const [contactoActivo, setContactoActivo] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const mensajesEndRef = useRef(null)

  // Token management
  const [tokensRestantes, setTokensRestantes] = useState(usuario?.tokensChat || 0)
  const [recargando, setRecargando] = useState(false)

  // Si vienes desde DetalleProducto, la URL tendrá ?vendedorId=X
  const vendedorIdParam = searchParams.get('vendedorId')
  const productoIdParam = searchParams.get('productoId')

  useEffect(() => {
    cargarContactos()
    // Sincronizar tokens del perfil real
    authService.obtenerPerfil().then(p => setTokensRestantes(p.tokensChat || 0))
  }, [])

  const cargarContactos = async () => {
    try {
      const data = await mensajeService.obtenerContactos()
      setContactos(data)
      setCargando(false)

      // Si venimos de un producto y ese vendedor no está en la lista de contactos,
      // creamos un contacto virtual temporal para poder escribirle
      if (vendedorIdParam) {
        const existe = data.find(c => c.usuario.id.toString() === vendedorIdParam)
        if (!existe) {
          setContactoActivo({ id: vendedorIdParam, nombre: 'Vendedor nuevo', rol: 'VENDEDOR' })
          setMensajes([])
        } else {
          seleccionarContacto(existe.usuario)
        }
      } else if (data.length > 0 && !contactoActivo) {
        seleccionarContacto(data[0].usuario)
      }
    } catch (e) {
      setCargando(false)
    }
  }

  const seleccionarContacto = async (contactoUsuario) => {
    setContactoActivo(contactoUsuario)
    try {
      const data = await mensajeService.obtenerConversacion(contactoUsuario.id)
      setMensajes(data)
      scrollToBottom()
      // Refrescar contactos para quitar el badge de "no leídos"
      mensajeService.obtenerContactos().then(setContactos)
    } catch (e) {
      toastError("Error al cargar la conversación")
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !contactoActivo) return

    setEnviando(true)
    try {
      const payload = {
        destinatarioId: contactoActivo.id,
        contenido: nuevoMensaje
      }
      if (productoIdParam) {
        payload.productoId = productoIdParam
      }

      const guardado = await mensajeService.enviarMensaje(payload)
      setMensajes([...mensajes, guardado])
      setNuevoMensaje('')
      scrollToBottom()
      
      // Descontar token visualmente si es comprador
      if (usuario.rol === 'COMPRADOR') {
        setTokensRestantes(prev => prev - 1)
      }
    } catch (e) {
      toastError(e.response?.data?.message || "Error al enviar el mensaje")
    } finally {
      setEnviando(false)
    }
  }

  const handleRecargarTokens = async () => {
    setRecargando(true)
    try {
      const res = await mensajeService.recargarTokens(50) // Paquete de 50 tokens
      setTokensRestantes(parseInt(res.tokensRestantes))
      success(res.mensaje)
    } catch (e) {
      toastError("Error al recargar tokens")
    } finally {
      setRecargando(false)
    }
  }

  if (cargando) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-mercatto-accent" size={40} /></div>

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
      
      {/* Sidebar de Contactos */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="font-black text-xl text-slate-800 dark:text-white">Mensajes</h2>
          
          {usuario.rol === 'COMPRADOR' && (
            <div className="mt-3 bg-indigo-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Coins size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Tu Saldo</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{tokensRestantes} Tokens</p>
                </div>
              </div>
              <button 
                onClick={handleRecargarTokens}
                disabled={recargando}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                {recargando ? '...' : '+ Recargar'}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactos.length === 0 && !vendedorIdParam ? (
            <p className="text-center text-slate-400 text-sm p-10">No tienes conversaciones activas.</p>
          ) : (
            contactos.map((c) => (
              <button
                key={c.usuario.id}
                onClick={() => seleccionarContacto(c.usuario)}
                className={`w-full text-left p-4 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-800/50 ${
                  contactoActivo?.id === c.usuario.id ? 'bg-indigo-50 dark:bg-slate-800' : 'hover:bg-white dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {c.usuario.rol === 'VENDEDOR' ? <Store size={20} /> : <User size={20} />}
                  </div>
                  {c.noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {c.noLeidos}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{c.usuario.nombre}</h4>
                  <p className="text-xs text-slate-500 truncate">{c.ultimoMensaje}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {contactoActivo ? (
          <>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                {contactoActivo.rol === 'VENDEDOR' ? <Store size={18} /> : <User size={18} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{contactoActivo.nombre}</h3>
                <p className="text-xs text-slate-500">{contactoActivo.rol === 'VENDEDOR' ? 'Vendedor' : 'Cliente'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {mensajes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <MessageSquare size={48} className="opacity-20" />
                  <p>Inicia la conversación con {contactoActivo.nombre}</p>
                  {usuario.rol === 'COMPRADOR' && <p className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">El primer mensaje consumirá 1 Token</p>}
                </div>
              ) : (
                mensajes.map((m, i) => {
                  const soyYo = m.remitente.id === usuario.id;
                  return (
                    <div key={i} className={`flex ${soyYo ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 ${soyYo ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`}>
                        {m.producto && i === 0 && (
                          <div className="mb-2 p-2 bg-black/10 rounded-lg text-[10px] font-bold">
                            📦 Ref: {m.producto.titulo}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{m.contenido}</p>
                        <span className={`text-[10px] mt-2 block ${soyYo ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.fechaEnvio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={mensajesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleEnviar} className="flex gap-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder={usuario.rol === 'COMPRADOR' ? "Escribe tu mensaje (Cuesta 1 Token)..." : "Responde al cliente..."}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full px-6 py-3 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={enviando || !nuevoMensaje.trim()}
                  className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={64} className="opacity-10 mb-4" />
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Mensajes
