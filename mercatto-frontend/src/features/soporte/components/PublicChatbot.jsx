import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import api from '@/utils/api'
import {
  X,
  Send,
  Sparkles,
  ExternalLink,
  Headphones,
  CheckCircle2,
  Mail,
  User,
  Phone,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Truck,
  Store,
  Tag
} from 'lucide-react'

// Línea oficial de atención al cliente Mercatto (Colombia)
const WHATSAPP_SOPORTE = '573233882717'
const MENSAJE_WHATSAPP = encodeURIComponent(
  '¡Hola Mercatto! 👋 Estoy navegando en el marketplace y requiero asesoría personalizada antes de registrarme.'
)

const OPCIONES_GUIA = [
  {
    id: 'como_comprar',
    titulo: '¿Cómo comprar en Mercatto?',
    subtitulo: 'Paso a paso para hacer tu primer pedido',
    icono: ShoppingBag,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
  },
  {
    id: 'medios_pago',
    titulo: 'Métodos de pago aceptados',
    subtitulo: 'Tarjetas, PSE, Nequi y Contra Entrega',
    icono: CreditCard,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
  },
  {
    id: 'vender',
    titulo: '¿Cómo abrir mi propia tienda?',
    subtitulo: 'Planes, comisiones y publicación de productos',
    icono: Store,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
  },
  {
    id: 'envios',
    titulo: 'Cobertura de envíos en Colombia',
    subtitulo: 'Transportadoras aliadas y flete gratis',
    icono: Truck,
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60'
  },
  {
    id: 'cupones',
    titulo: 'Cupones de descuento activos',
    subtitulo: 'Ahorra en tu compra con códigos oficiales',
    icono: Tag,
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
  },
  {
    id: 'soporte_directo',
    titulo: 'Atención al Cliente Mercatto',
    subtitulo: 'Hablar con un asesor comercial o de soporte',
    icono: Headphones,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    destacado: true
  }
]

const RESPUESTAS_BASE = {
  como_comprar:
    '🛒 **Comprar en Mercatto es muy sencillo:**\n\n1. Explora el catálogo de productos de tiendas verificadas.\n2. Agrega los artículos deseados a tu bolsa de compras.\n3. Procede al checkout, ingresa tu dirección de entrega en Colombia.\n4. Selecciona tu medio de pago favorito (Tarjeta, PSE, Nequi o Pago Contra Entrega en efectivo al recibir).',
  medios_pago:
    '💳 **Medios de Pago Seguros en Mercatto:**\n\n• **Tarjetas de Crédito y Débito:** Visa, Mastercard, American Express.\n• **Transferencias en Línea:** PSE con cualquier banco colombiano, Nequi y Daviplata.\n• **Pago Contra Entrega:** Paga en efectivo únicamente cuando el paquete llegue a la puerta de tu casa.',
  vender:
    '🏬 **Vender en Mercatto:**\n\nPuedes abrir tu tienda en minutos con herramientas profesionales de gestión de inventario, envíos y pagos asegurados. Ofrecemos comisiones competitivas y planes adaptados para emprendedores y marcas establecidas. Haz clic en "Crear cuenta" para empezar.',
  cupones:
    '🏷️ **Cupones Activos de Mercatto:**\n\n• **MERCATTO10:** 10% de descuento en el total de tu orden.\n• **BIENVENIDA:** $20.000 COP de obsequio en compras superiores a $100.000 COP.\n\nPuedes aplicarlos al momento de revisar tu pedido en el carrito o en el checkout.',
  envios:
    '🚚 **Envíos y Despachos Nacionales:**\n\nDespachamos a todas las ciudades y municipios de Colombia a través de las principales transportadoras del país (Servientrega, Coordinadora, Interrapidísimo y Envía). Además, en compras superiores a **$150.000 COP**, el envío es totalmente gratuito.'
}

export const PublicChatbot = () => {
  const { autenticado } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [mensajeInput, setMensajeInput] = useState('')
  const [vistaActual, setVistaActual] = useState('chat') // 'chat' | 'menu_opciones' | 'formulario_contacto'
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      remitente: 'bot',
      texto:
        '¡Hola! Te damos la bienvenida a **Mercatto**, el marketplace multitienda de Colombia. ¿En qué podemos orientarte el día de hoy?',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [escribiendo, setEscribiendo] = useState(false)
  const [ticketCargando, setTicketCargando] = useState(false)
  const [ticketError, setTicketError] = useState('')
  const [formTicket, setFormTicket] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Consulta desde Asistente Mercatto',
    mensaje: ''
  })

  const mensajesContainerRef = useRef(null)

  // Solo se muestra a visitantes no logueados en el Home
  if (autenticado) return null

  // Scroll suave contenido únicamente dentro del contenedor del chat
  const scrollAlFinal = () => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTo({
        top: mensajesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    if (abierto) {
      scrollAlFinal()
    }
  }, [mensajes, escribiendo, vistaActual, abierto])

  const seleccionarOpcion = (opcionId) => {
    const opcion = OPCIONES_GUIA.find((o) => o.id === opcionId)
    if (!opcion) return

    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Agrega la elección del usuario
    setMensajes((prev) => [
      ...prev,
      { id: Date.now(), remitente: 'usuario', texto: opcion.titulo, hora }
    ])

    if (opcionId === 'soporte_directo') {
      setEscribiendo(true)
      setTimeout(() => {
        setEscribiendo(false)
        setMensajes((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            remitente: 'bot',
            texto:
              'Nuestro equipo de **Atención al Cliente Mercatto** está a tu disposición para ayudarte con cualquier inquietud. ¿Cómo prefieres comunicarte?',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            esOpcionSoporte: true
          }
        ])
        setVistaActual('chat')
      }, 500)
      return
    }

    setEscribiendo(true)
    setTimeout(() => {
      setEscribiendo(false)
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'bot',
          texto: RESPUESTAS_BASE[opcionId] || '¿Deseas consultar alguna otra información?',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ofrecerMenu: true
        }
      ])
      setVistaActual('chat')
    }, 600)
  }

  // Generar o recuperar sessionId persistente para la conversación
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('mercatto_chat_sid')
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 11)
      sessionStorage.setItem('mercatto_chat_sid', sid)
    }
    return sid
  })

  const handleEnviarMensaje = async (e, textoDirecto = null) => {
    if (e && e.preventDefault) e.preventDefault()
    const texto = (textoDirecto !== null ? textoDirecto : mensajeInput).trim()
    if (!texto) return

    setMensajeInput('')
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setMensajes((prev) => [
      ...prev,
      { id: Date.now(), remitente: 'usuario', texto, hora }
    ])

    const t = texto.toLowerCase()
    setEscribiendo(true)

    // Si pide explícitamente contacto con humano/soporte
    if (t.includes('soporte') || t.includes('humano') || t.includes('asesor') || t.includes('admin') || t.includes('persona')) {
      setEscribiendo(false)
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'bot',
          texto: 'Con gusto te comunico con el equipo de **Atención al Cliente Mercatto**. Puedes escribirnos directamente por WhatsApp o dejarnos tu solicitud por mensaje:',
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          esOpcionSoporte: true,
          ofrecerMenu: false
        }
      ])
      return
    }

    try {
      // Llamada directa al agente de Inteligencia Artificial en n8n
      const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/mercatto-chat'
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: texto,
          sessionId: sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor de IA')
      }

      const data = await response.json()
      const respuestaIA = data?.reply || data?.output || 'Disculpa, no pude procesar tu mensaje en este momento.'

      setEscribiendo(false)
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'bot',
          texto: respuestaIA,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          esOpcionSoporte: false,
          ofrecerMenu: true
        }
      ])
    } catch (err) {
      console.warn('Fallo n8n webhook, usando respuestas de respaldo:', err)
      setEscribiendo(false)

      let respuesta = ''
      if (t.includes('pago') || t.includes('tarjeta') || t.includes('nequi') || t.includes('banco') || t.includes('pse')) {
        respuesta = RESPUESTAS_BASE.medios_pago
      } else if (t.includes('comprar') || t.includes('pedido') || t.includes('orden')) {
        respuesta = RESPUESTAS_BASE.como_comprar
      } else if (t.includes('vender') || t.includes('tienda') || t.includes('comision') || t.includes('proveedor')) {
        respuesta = RESPUESTAS_BASE.vender
      } else if (t.includes('cupon') || t.includes('descuento') || t.includes('promo')) {
        respuesta = RESPUESTAS_BASE.cupones
      } else if (t.includes('envio') || t.includes('flete') || t.includes('ciudad') || t.includes('despacho')) {
        respuesta = RESPUESTAS_BASE.envios
      } else {
        respuesta = '¡Hola! En Mercatto estamos para ayudarte. ¿Deseas consultar sobre compras, envíos, métodos de pago o cómo vender con nuestra comisión única del 4%?'
      }

      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          remitente: 'bot',
          texto: respuesta,
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          esOpcionSoporte: false,
          ofrecerMenu: true
        }
      ])
    }
  }

  const handleEnviarFormulario = async (e) => {
    e.preventDefault()
    setTicketError('')

    if (!formTicket.nombre.trim() || !formTicket.email.trim() || !formTicket.mensaje.trim()) {
      setTicketError('Por favor completa nombre, correo y tu consulta.')
      return
    }

    try {
      setTicketCargando(true)
      await api.post('/soporte/ticket', formTicket)
      setTicketCargando(false)
      setVistaActual('chat')

      const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now(),
          remitente: 'bot',
          texto: `✅ **Solicitud radicada con éxito.**\n\nHemos recibido tu consulta, ${formTicket.nombre}. Un asesor de **Atención al Cliente Mercatto** revisará tu caso y se pondrá en contacto contigo a través de tu correo **${formTicket.email}** a la mayor brevedad.`,
          hora,
          ofrecerMenu: true
        }
      ])

      setFormTicket({
        nombre: '',
        email: '',
        telefono: '',
        asunto: 'Consulta desde Asistente Mercatto',
        mensaje: ''
      })
    } catch (err) {
      setTicketCargando(false)
      setTicketError(err.response?.data?.message || 'No se pudo enviar la solicitud. Por favor intenta de nuevo.')
    }
  }

  const reiniciarConversacion = () => {
    const nuevoSid = 'session_' + Math.random().toString(36).substring(2, 11)
    sessionStorage.setItem('mercatto_chat_sid', nuevoSid)
    setMensajes([
      {
        id: Date.now(),
        remitente: 'bot',
        texto:
          '¡Hola de nuevo! ✨ Soy el Asistente Inteligente de **Mercatto**. ¿En qué puedo colaborarte hoy? Pregúntame lo que quieras sobre productos, comisiones, pagos o envíos.',
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ])
    setVistaActual('chat')
  }

  const enviarPreguntaRapida = (preguntaTexto) => {
    setMensajeInput(preguntaTexto)
    // Disparo inmediato simulando envío
    const e = { preventDefault: () => {} }
    setTimeout(() => {
      handleEnviarMensaje(e, preguntaTexto)
    }, 50)
  }

  // Convierte los asteriscos **texto** en negrita limpia de verdad sin mostrar asteriscos
  const renderizarTextoFormateado = (texto) => {
    if (!texto) return ''
    const partes = texto.split(/(\*\*.*?\*\*)/g)
    return partes.map((parte, i) => {
      if (parte.startsWith('**') && parte.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {parte.slice(2, -2)}
          </strong>
        )
      }
      return parte
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Botón Flotante Circular IA */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-xl shadow-violet-600/35 hover:shadow-2xl hover:shadow-violet-600/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border-2 border-white/30"
          aria-label="Abrir Asistente Mercatto AI"
          title="Mercatto AI"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles size={24} className="text-white group-hover:rotate-12 transition-transform duration-300 drop-shadow" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-violet-700 rounded-full animate-pulse" />
          </div>
        </button>
      )}

      {/* Ventana de Atención Flotante */}
      {abierto && (
        <div className="w-[360px] sm:w-[420px] h-[600px] max-h-[88vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
          
          {/* Header Elegante Degradado */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-500/20 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">
                  <Sparkles size={20} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-wide">Mercatto Bot</h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    IA Activa
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <span>Asistente Oficial con Gemini</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={reiniciarConversacion}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer text-xs"
                title="Reiniciar conversación"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setVistaActual(vistaActual === 'menu_opciones' ? 'chat' : 'menu_opciones')}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer text-xs"
                title="Guía rápida"
              >
                <HelpCircle size={16} />
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Subheader Informativo */}
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-slate-800/80 border-b border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Comisión fija única: <strong className="text-indigo-600 dark:text-indigo-400">4% por venta</strong>
            </span>
            <Link
              to="/registro"
              onClick={() => setAbierto(false)}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 text-[11px]"
            >
              <span>Vende gratis</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Contenido Dinámico: Chat o Menú Temas */}
          {vistaActual === 'menu_opciones' ? (
            /* Vista del Menú de Temas Frecuentes */
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 bg-slate-50/70 dark:bg-slate-950/40">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Temas Frecuentes
                </span>
                <button
                  onClick={() => setVistaActual('chat')}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Volver al chat
                </button>
              </div>

              <div className="space-y-2">
                {OPCIONES_GUIA.map((op) => {
                  const Icono = op.icono
                  return (
                    <button
                      key={op.id}
                      onClick={() => seleccionarOpcion(op.id)}
                      className="w-full p-3 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.01] cursor-pointer flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${op.color}`}>
                          <Icono size={17} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                            {op.titulo}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {op.subtitulo}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : vistaActual === 'formulario_contacto' ? (
            /* Vista Limpia del Formulario de Solicitud */
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/40">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mensaje para Atención al Cliente</h4>
                      <p className="text-[10px] text-slate-400">Te responderemos directamente a tu correo</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setVistaActual('chat')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>

                {ticketError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-[11px] flex items-center gap-1.5">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                <form onSubmit={handleEnviarFormulario} className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Andrés Ramírez"
                      value={formTicket.nombre}
                      onChange={(e) => setFormTicket({ ...formTicket, nombre: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={formTicket.email}
                        onChange={(e) => setFormTicket({ ...formTicket, email: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="300 000 0000"
                        value={formTicket.telefono}
                        onChange={(e) => setFormTicket({ ...formTicket, telefono: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                      ¿En qué te podemos asesorar? *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escribe tu consulta detallada..."
                      value={formTicket.mensaje}
                      onChange={(e) => setFormTicket({ ...formTicket, mensaje: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={ticketCargando}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                    >
                      {ticketCargando ? 'Enviando solicitud...' : 'Enviar Consulta'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVistaActual('chat')}
                      className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Vista del Historial de Chat */
            <div
              ref={mensajesContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/60 dark:bg-slate-950/50"
            >
              {mensajes.map((m) => {
                const esBot = m.remitente === 'bot'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${esBot ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[90%]">
                      {esBot && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                          <Sparkles size={12} />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-sm text-xs ${
                          esBot
                            ? 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs shadow-indigo-500/10'
                        }`}
                      >
                        {renderizarTextoFormateado(m.texto)}

                        {/* Tarjetas de Soporte dentro del mensaje */}
                        {m.esOpcionSoporte && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
                            <a
                              href={`https://wa.me/${WHATSAPP_SOPORTE}?text=${MENSAJE_WHATSAPP}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-xs"
                            >
                              <div className="flex items-center gap-2">
                                <MessageCircle size={15} />
                                <span>Hablar por WhatsApp</span>
                              </div>
                              <ExternalLink size={12} />
                            </a>

                            <button
                              onClick={() => setVistaActual('formulario_contacto')}
                              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-800 dark:text-white font-semibold transition cursor-pointer border border-slate-200 dark:border-slate-600"
                            >
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-indigo-600 dark:text-indigo-400" />
                                <span>Dejar solicitud por correo</span>
                              </div>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 px-8 mt-1">{m.hora}</span>
                  </div>
                )
              })}

              {/* Indicador suave de IA Pensando */}
              {escribiendo && (
                <div className="flex items-end gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-1">
                    <Sparkles size={12} />
                  </div>
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Barra de Acciones y Entrada de Texto */}
          {vistaActual === 'chat' && (
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              
              {/* Chips de Preguntas Frecuentes Rápidas (Scroll invisible suave) */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  type="button"
                  onClick={() => enviarPreguntaRapida('¿Cuánto cobran de comisión a los vendedores?')}
                  className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 hover:bg-indigo-100 transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  🏷️ ¿Comisiones?
                </button>
                <button
                  type="button"
                  onClick={() => enviarPreguntaRapida('¿Cómo abro mi tienda en Mercatto?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  🏪 Abrir tienda
                </button>
                <button
                  type="button"
                  onClick={() => enviarPreguntaRapida('¿Qué métodos de pago reciben?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  💳 Métodos de pago
                </button>
                <button
                  type="button"
                  onClick={() => setVistaActual('formulario_contacto')}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 hover:bg-emerald-100 transition whitespace-nowrap cursor-pointer shrink-0"
                >
                  📞 Asesor humano
                </button>
              </div>

              {/* Input Moderno Píldora */}
              <form onSubmit={handleEnviarMensaje} className="flex items-center gap-2">
                <input
                  type="text"
                  value={mensajeInput}
                  onChange={(e) => setMensajeInput(e.target.value)}
                  placeholder="Pregúntale a Mercatto Bot..."
                  className="flex-1 text-xs px-4 py-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!mensajeInput.trim()}
                  className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white transition-all duration-200 cursor-pointer shrink-0 shadow-md shadow-indigo-500/25 active:scale-95 hover:scale-105"
                  title="Enviar consulta"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PublicChatbot
