import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { mensajeService } from '@/features/mensajes'
import { productoService } from '@/features/productos'
import { websocketService as wsService } from '@/features/mensajes'
import Button from '@/components/common/Button'
import { 
  Send, 
  Coins, 
  User, 
  Store, 
  Loader2, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Zap, 
  X, 
  ShieldAlert,
  ShoppingBag,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Search,
  Shield,
  ChevronLeft
} from 'lucide-react'

export const Mensajes = () => {
  const { usuario, actualizarUsuario } = useAuth()
  const { success, error: toastError, info } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [contactos, setContactos] = useState([])
  const [busquedaContacto, setBusquedaContacto] = useState('')
  const [contactoActivo, setContactoActivo] = useState(null)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const mensajesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Token management & Checkout con Tarjeta
  const [tokensRestantes, setTokensRestantes] = useState(usuario?.tokensChat || 0)
  const [modalPlanes, setModalPlanes] = useState(false)
  const [pasoModal, setPasoModal] = useState('seleccion') // 'seleccion' | 'pago' | 'exito'
  const [planSeleccionado, setPlanSeleccionado] = useState(null)
  const [procesandoPago, setProcesandoPago] = useState(false)
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '',
    titular: '',
    expiracion: '',
    cvc: ''
  })
  const [reciboPago, setReciboPago] = useState(null)

  // Params de producto o vendedor
  const vendedorIdParam = searchParams.get('vendedorId')
  const productoIdParam = searchParams.get('productoId')
  const [productoRef, setProductoRef] = useState(null)

  useEffect(() => {
    sincronizarSaldo()
    cargarContactos()
    if (productoIdParam) {
      productoService.obtenerPorId(productoIdParam).then(setProductoRef).catch(() => {})
    }
  }, [vendedorIdParam, productoIdParam])

  // --- WEBSOCKET EN TIEMPO REAL ---
  useEffect(() => {
    if (!usuario?.id) return

    // TÃ³pico a escuchar: si es ADMIN escucha el global, si no, escucha sus propios mensajes
    const topic = usuario.rol === 'ADMIN' 
      ? '/topic/mensajes/admin' 
      : `/topic/mensajes/${usuario.id}`

    const desuscribir = wsService.suscribir(topic, (nuevoMsg) => {
      if (!nuevoMsg || !nuevoMsg.id) return

      // Si el mensaje pertenece a la conversaciÃ³n actualmente abierta en pantalla
      setContactoActivo(currentContacto => {
        if (!currentContacto) return currentContacto

        const esAdmin = usuario.rol === 'ADMIN'
        let perteneceAEstaConversacion = false

        if (esAdmin) {
          const u1 = currentContacto.id
          const u2 = currentContacto.remitenteId
          const remitenteId = nuevoMsg.remitente?.id
          const destinatarioId = nuevoMsg.destinatario?.id

          perteneceAEstaConversacion = 
            (remitenteId === u1 && destinatarioId === u2) ||
            (remitenteId === u2 && destinatarioId === u1)
        } else {
          perteneceAEstaConversacion = 
            nuevoMsg.remitente?.id === currentContacto.id ||
            nuevoMsg.destinatario?.id === currentContacto.id
        }

        if (perteneceAEstaConversacion) {
          setMensajes(prev => {
            // Evitar duplicados si ya fue aÃ±adido por el propio usuario localmente
            if (prev.some(m => m.id === nuevoMsg.id)) return prev
            return [...prev, nuevoMsg]
          })
          scrollToBottom()
        }

        return currentContacto
      })

      // Refrescar la lista de contactos para mostrar el Ãºltimo mensaje o contador
      mensajeService.obtenerContactos().then(res => setContactos(res || []))
    })

    return () => {
      if (typeof desuscribir === 'function') desuscribir()
    }
  }, [usuario?.id, usuario?.rol])

  const sincronizarSaldo = async () => {
    try {
      const data = await mensajeService.obtenerSaldoTokens()
      if (data?.tokensRestantes !== undefined) {
        setTokensRestantes(data.tokensRestantes)
        if (actualizarUsuario) {
          actualizarUsuario({ tokensChat: data.tokensRestantes })
        }
      }
    } catch {
      // saldo previo en memoria
    }
  }

  const cargarContactos = async () => {
    try {
      const data = await mensajeService.obtenerContactos()
      setContactos(data || [])
      setCargando(false)

      if (vendedorIdParam) {
        const existe = data?.find(c => c.usuario.id.toString() === vendedorIdParam)
        if (!existe) {
          setContactoActivo({ 
            id: parseInt(vendedorIdParam), 
            nombre: 'Vendedor del Producto', 
            rol: 'VENDEDOR' 
          })
          setMensajes([])
        } else {
          seleccionarContacto(existe.usuario, existe.remitenteId, existe)
        }
      } else if (data && data.length > 0 && !contactoActivo) {
        seleccionarContacto(data[0].usuario, data[0].remitenteId, data[0])
      }
    } catch (e) {
      setCargando(false)
    }
  }

  const seleccionarContacto = async (contactoUsuario, remitenteId = null, extraData = {}) => {
    setContactoActivo({
      ...contactoUsuario,
      ...extraData,
      remitenteId: remitenteId || extraData.remitenteId
    })
    try {
      const data = await mensajeService.obtenerConversacion(contactoUsuario.id, remitenteId || extraData.remitenteId)
      setMensajes(data || [])
      scrollToBottom()
      mensajeService.obtenerContactos().then(res => setContactos(res || []))
    } catch (e) {
      toastError("Error al cargar la conversaciÃ³n")
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 60)
  }

  const handleEnviar = async (e) => {
    e.preventDefault()
    if (!nuevoMensaje.trim() || !contactoActivo) return

    setEnviando(true)
    try {
      const payload = {
        destinatarioId: contactoActivo.id,
        contenido: nuevoMensaje.trim()
      }
      if (productoIdParam) {
        payload.productoId = parseInt(productoIdParam)
      }

      const guardado = await mensajeService.enviarMensaje(payload)
      setMensajes(prev => [...prev, guardado])
      setNuevoMensaje('')
      scrollToBottom()

      // Actualizar lista de contactos
      mensajeService.obtenerContactos().then(res => setContactos(res || []))
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || "Error al enviar el mensaje"
      toastError(msg)
    } finally {
      setEnviando(false)
    }
  }

  const handleAbrirPlanes = () => {
    setPasoModal('seleccion')
    setModalPlanes(true)
  }

  const handleCerrarModal = () => {
    setModalPlanes(false)
    setPasoModal('seleccion')
    setPlanSeleccionado(null)
  }

  const handleSeleccionarPlan = (plan) => {
    setPlanSeleccionado(plan)
    setPasoModal('pago')
  }

  const handleNumeroTarjetaChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim()
    setDatosTarjeta(prev => ({ ...prev, numero: formatted }))
  }

  const handleExpiracionChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (raw.length >= 3) {
      setDatosTarjeta(prev => ({ ...prev, expiracion: `${raw.slice(0, 2)}/${raw.slice(2)}` }))
    } else {
      setDatosTarjeta(prev => ({ ...prev, expiracion: raw }))
    }
  }

  const handleProcesarPagoConTarjeta = async (e) => {
    e.preventDefault()
    if (!datosTarjeta.numero || datosTarjeta.numero.replace(/\s/g, '').length < 15) {
      toastError('Por favor ingresa un nÃºmero de tarjeta vÃ¡lido (16 dÃ­gitos).')
      return
    }
    if (!datosTarjeta.titular.trim()) {
      toastError('Por favor ingresa el nombre del titular de la tarjeta.')
      return
    }
    if (!datosTarjeta.expiracion || datosTarjeta.expiracion.length < 5) {
      toastError('Por favor ingresa una fecha de expiraciÃ³n vÃ¡lida (MM/AA).')
      return
    }
    if (!datosTarjeta.cvc || datosTarjeta.cvc.length < 3) {
      toastError('Por favor ingresa el cÃ³digo de seguridad CVC (3 dÃ­gitos).')
      return
    }

    setProcesandoPago(true)
    try {
      // Simular latencia de autorizaciÃ³n con red de adquirencia (Visa/Mastercard)
      await new Promise(r => setTimeout(r, 1200))
      
      const res = await mensajeService.recargarTokens(planSeleccionado.tokens)
      const nuevoTotal = parseInt(res.tokensRestantes)
      setTokensRestantes(nuevoTotal)
      if (actualizarUsuario) {
        actualizarUsuario({ tokensChat: nuevoTotal })
      }

      const numLimpio = datosTarjeta.numero.replace(/\s/g, '')
      setReciboPago({
        transaccionId: 'MC-' + Math.floor(100000 + Math.random() * 900000),
        ultimos4: numLimpio.slice(-4),
        plan: planSeleccionado.nombre,
        tokensAcreditados: planSeleccionado.tokens,
        total: planSeleccionado.precio,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      setPasoModal('exito')
      success('Â¡Pago con tarjeta aprobado y tokens acreditados!')
    } catch {
      toastError("Error al procesar el pago con la entidad bancaria.")
    } finally {
      setProcesandoPago(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="animate-spin text-mercatto-accent" size={44} />
        <p className="text-sm font-semibold text-slate-500">Cargando bandeja de mensajes...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto h-[82vh] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 my-6 font-sans">
      
      {/* Sidebar de Contactos */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/60">
        
        {/* Cabecera del Sidebar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare size={22} className="text-mercatto-accent" />
              <span>Mensajes</span>
            </h2>
          </div>
          
          {/* Indicador de Chat Libre y Directo */}
          <div className="mt-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 p-2.5 rounded-2xl border border-emerald-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">ComunicaciÃ³n</p>
                <p className="text-xs font-black text-slate-800 dark:text-white">
                  Chat Ilimitado y Gratuito
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
              Activo
            </span>
          </div>

          {/* Buscador de Chats / Usuarios */}
          <div className="mt-3 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busquedaContacto}
              onChange={(e) => setBusquedaContacto(e.target.value)}
              placeholder={usuario?.rol === 'VENDEDOR' ? "Buscar clientes en chat..." : "Buscar contactos..."}
              className="w-full pl-9 pr-7 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 focus:outline-none focus:border-indigo-500 transition"
            />
            {busquedaContacto && (
              <button
                onClick={() => setBusquedaContacto('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                âœ•
              </button>
            )}
          </div>
        </div>

        {/* Lista de Conversaciones */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {contactos.length === 0 && !vendedorIdParam ? (
            <div className="text-center text-slate-400 p-10 space-y-2">
              <MessageSquare size={36} className="mx-auto opacity-30" />
              <p className="text-sm">No tienes conversaciones activas.</p>
              <p className="text-xs text-slate-400">
                {usuario?.rol === 'VENDEDOR' 
                  ? 'AquÃ­ aparecerÃ¡n los clientes que te consulten desde tus productos.' 
                  : 'EscrÃ­bele a un vendedor desde cualquier producto del catÃ¡logo.'}
              </p>
            </div>
          ) : (
            contactos
              .filter(c => !busquedaContacto || c.usuario?.nombre?.toLowerCase().includes(busquedaContacto.toLowerCase()) || c.usuario?.email?.toLowerCase().includes(busquedaContacto.toLowerCase()))
              .map((c) => {
              const activo = usuario?.rol === 'ADMIN'
                ? (contactoActivo?.id === c.usuario.id && contactoActivo?.remitenteId === c.remitenteId)
                : (contactoActivo?.id === c.usuario.id)
              return (
                <button
                  key={c.usuario.id + (c.remitenteId ? `_${c.remitenteId}` : '')}
                  onClick={() => seleccionarContacto(c.usuario, c.remitenteId, c)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors cursor-pointer ${
                    activo 
                      ? 'bg-indigo-50/80 dark:bg-slate-800 border-l-4 border-indigo-600' 
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold ${
                      usuario?.rol === 'ADMIN' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
                        : 'bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {usuario?.rol === 'ADMIN' ? <Shield size={18} /> : (c.usuario.rol === 'VENDEDOR' ? <Store size={20} /> : <User size={20} />)}
                    </div>
                    {c.noLeidos > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {c.noLeidos}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                        {usuario?.rol === 'ADMIN' && c.remitenteNombre && c.destinatarioNombre
                          ? `${c.remitenteNombre} â†” ${c.destinatarioNombre}`
                          : c.usuario.nombre}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{c.ultimoMensaje || 'ConversaciÃ³n iniciada'}</p>
                    {usuario?.rol === 'ADMIN' && (
                      <span className="text-[10px] text-rose-500 font-semibold uppercase tracking-wider block mt-0.5">
                        SupervisiÃ³n Admin
                      </span>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Ãrea del Chat */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {contactoActivo ? (
          <>
            {/* Header del Chat */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  usuario?.rol === 'ADMIN'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}>
                  {usuario?.rol === 'ADMIN' ? <Shield size={20} /> : (contactoActivo.rol === 'VENDEDOR' ? <Store size={20} /> : <User size={20} />)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {usuario?.rol === 'ADMIN' && contactoActivo?.remitenteNombre && contactoActivo?.destinatarioNombre
                      ? `${contactoActivo.remitenteNombre} â†” ${contactoActivo.destinatarioNombre}`
                      : contactoActivo.nombre}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {usuario?.rol === 'ADMIN' 
                      ? 'ðŸ›¡ï¸ AuditorÃ­a de Chat en Vivo (Super Administrador)' 
                      : (contactoActivo.rol === 'VENDEDOR' ? 'Vendedor Verificado' : 'Cliente Comprador')}
                  </span>
                </div>
              </div>

              {productoRef && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <ShoppingBag size={14} className="text-indigo-600" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{productoRef.titulo}</span>
                </div>
              )}
            </div>

            {/* Mensajes Scrollables */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
              {mensajes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center">
                    <MessageSquare size={32} />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white">ConversaciÃ³n directa</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Inicia el diÃ¡logo con <span className="font-bold text-slate-700 dark:text-slate-300">{contactoActivo.nombre}</span>.
                  </p>
                  {usuario?.rol === 'COMPRADOR' && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full font-bold">
                      <ShieldCheck size={13} /> Chat directo y gratuito con el vendedor.
                    </span>
                  )}
                </div>
              ) : (
                mensajes.map((m, i) => {
                  const esAdmin = usuario?.rol === 'ADMIN'
                  const soyYo = !esAdmin && m.remitente?.id === usuario?.id
                  // En modo Admin, colocamos al comprador a la izquierda y al vendedor a la derecha para claridad
                  const alinearDerecha = esAdmin ? (m.remitente?.rol === 'VENDEDOR') : soyYo

                  return (
                    <div key={m.id || i} className={`flex ${alinearDerecha ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                        alinearDerecha 
                          ? (esAdmin ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-indigo-600 text-white rounded-tr-sm')
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                      }`}>
                        {/* Etiqueta de quiÃ©n envÃ­a (vital para el Admin) */}
                        {esAdmin && (
                          <div className={`text-[11px] font-bold mb-1.5 flex items-center gap-1.5 ${
                            alinearDerecha ? 'text-emerald-100' : 'text-indigo-600 dark:text-indigo-400'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {m.remitente?.nombre} ({m.remitente?.rol === 'VENDEDOR' ? 'Vendedor' : 'Comprador'})
                          </div>
                        )}

                        {m.producto && i === 0 && (
                          <div className={`mb-2 p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                            alinearDerecha ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            <ShoppingBag size={13} />
                            <span className="truncate">Ref: {m.producto.titulo}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.contenido}</p>
                        <span className={`text-[10px] mt-1.5 block text-right font-medium ${alinearDerecha ? 'text-white/80' : 'text-slate-400'}`}>
                          {m.fechaEnvio ? new Date(m.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input para Escribir Mensaje (Oculto para el Admin en Modo AuditorÃ­a) */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              {usuario?.rol === 'ADMIN' ? (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Shield size={18} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Modo AuditorÃ­a / Solo Lectura</p>
                    <p className="text-[11px] text-slate-500">
                      Como Administrador estÃ¡s supervisando la conversaciÃ³n neutralmente para auditorÃ­a y resoluciÃ³n de disputas. No puedes intervenir en el chat privado.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviar} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder={
                      usuario?.rol === 'COMPRADOR' 
                        ? `Escribe tu pregunta a ${contactoActivo.nombre}...` 
                        : `Escribe tu respuesta al cliente...`
                    }
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 rounded-full px-5 py-3 text-sm outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={enviando || !nuevoMensaje.trim()}
                    className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center disabled:opacity-50 transition cursor-pointer shadow-md shadow-indigo-200 dark:shadow-none"
                    title="Enviar mensaje"
                  >
                    {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MessageSquare size={38} className="opacity-30" />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-lg">Bandeja de MensajerÃ­a</h3>
            <p className="text-xs max-w-sm text-slate-500">
              Selecciona una conversaciÃ³n del listado izquierdo para responder o coordinar ventas y entregas.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Mensajes

