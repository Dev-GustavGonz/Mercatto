import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import AddressForm from '../components/AddressForm'
import PaymentForm from '../components/PaymentForm'
import CartSummary from '../components/CartSummary'
import OrderSuccess from '../components/OrderSuccess'
import Button from '@/components/common/Button'
import pedidoService from '../services/pedidoService'
import pagoService from '../services/pagoService'
import { Lock, MapPin, CreditCard, ShieldCheck } from 'lucide-react'

export const Checkout = () => {
  const { items, cupon, limpiarCarrito, total } = useCart()
  const { autenticado, usuario } = useAuth()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  const STORAGE_KEY_CHECKOUT = 'mercatto_checkout_draft'

  // Recuperar borrador previo si existe
  const draftPrevio = (() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CHECKOUT)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  })()

  const [emailInvitado, setEmailInvitado] = useState(draftPrevio.emailInvitado || '')
  const [direccion, setDireccion] = useState({
    nombreCompleto: draftPrevio.direccion?.nombreCompleto || '',
    telefono: draftPrevio.direccion?.telefono || '',
    direccion: draftPrevio.direccion?.direccion || '',
    barrio: draftPrevio.direccion?.barrio || '',
    ciudad: draftPrevio.direccion?.ciudad || 'Medellín',
    departamento: draftPrevio.direccion?.departamento || 'Antioquia',
    notasEntrega: draftPrevio.direccion?.notasEntrega || '',
  })
  const [metodoPago, setMetodoPago] = useState(draftPrevio.metodoPago || 'WOMPI')
  const [loading, setLoading] = useState(false)
  const [pedidoCreado, setPedidoCreado] = useState(null)

  // Guardar en tiempo real cualquier cambio en el borrador (tanto para invitado como registrado)
  React.useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CHECKOUT,
        JSON.stringify({
          emailInvitado,
          direccion,
          metodoPago,
        })
      )
    } catch (e) {
      console.warn('No se pudo guardar borrador de checkout:', e)
    }
  }, [emailInvitado, direccion, metodoPago])

  // Función para limpiar el borrador una vez la compra sea exitosa
  const limpiarBorradorCheckout = () => {
    localStorage.removeItem(STORAGE_KEY_CHECKOUT)
  }

  // Si el usuario ya está autenticado, precargar sus datos de perfil si los campos están vacíos
  React.useEffect(() => {
    if (autenticado && usuario) {
      setDireccion((prev) => ({
        ...prev,
        nombreCompleto: prev.nombreCompleto || usuario.nombre || '',
        telefono: prev.telefono || usuario.telefono || '',
      }))
    }
  }, [autenticado, usuario])

  if (pedidoCreado) {
    return <OrderSuccess pedido={pedidoCreado} />
  }

  if (items.length === 0) {
    navigate('/carrito')
    return null
  }

  const handleProcesarCompra = async (e) => {
    e.preventDefault()

    // 1. Validaciones estrictas
    if (!autenticado) {
      if (!emailInvitado.trim()) {
        toastError('Por favor ingresa tu correo electrónico para enviarte la factura y confirmación.')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailInvitado.trim())) {
        toastError('El correo electrónico ingresado no tiene un formato válido (ejemplo: usuario@correo.com).')
        return
      }
    }

    if (!direccion.nombreCompleto?.trim()) {
      toastError('Por favor ingresa el nombre de quien recibirá el pedido.')
      return
    }

    if (!direccion.telefono?.trim() || direccion.telefono.trim().length < 7) {
      toastError('Por favor ingresa un número de teléfono válido para la transportadora.')
      return
    }

    if (!direccion.direccion?.trim()) {
      toastError('Por favor ingresa la dirección exacta de entrega.')
      return
    }

    if (!direccion.ciudad?.trim() || !direccion.departamento?.trim()) {
      toastError('Por favor especifica la ciudad y departamento de entrega.')
      return
    }

    setLoading(true)
    try {
      // 2. Construir payload del pedido
      const pedidoPayload = {
        nuevaDireccion: direccion,
        cuponCodigo: cupon?.codigo || null,
        metodoPago,
        emailInvitado: !autenticado ? emailInvitado.trim() : null,
        nombreInvitado: !autenticado ? direccion.nombreCompleto.trim() : null,
        telefonoInvitado: !autenticado ? direccion.telefono.trim() : null,
        items: items.map((i) => ({
          productoId: i.producto.id,
          varianteId: i.variante?.id || null,
          cantidad: i.cantidad,
        })),
      }

      // 3. Crear pedido según modo (autenticado o invitado)
      const pedidoRes = autenticado
        ? await pedidoService.crearPedido(pedidoPayload)
        : await pedidoService.crearPedidoInvitado(pedidoPayload)

      // 4. Iniciar Pasarela de Pago
      const pagoRes = autenticado
        ? await pagoService.iniciarPago(pedidoRes.id, metodoPago)
        : await pagoService.iniciarPagoInvitado(pedidoRes.id, metodoPago)

      // 5. Manejar según método de pago
      if (metodoPago === 'WOMPI') {
        if (window.WidgetCheckout && pagoRes.publicKey) {
          try {
            const checkout = new window.WidgetCheckout({
              currency: pagoRes.currency || 'COP',
              amountInCents: pagoRes.amountInCents,
              reference: pagoRes.reference,
              publicKey: pagoRes.publicKey,
              signature: { integrity: pagoRes.signatureIntegrity },
              customerData: {
                email: pagoRes.customerEmail || emailInvitado,
                fullName: pagoRes.customerFullName || direccion.nombreCompleto,
                phoneNumber: pagoRes.customerPhoneNumber || direccion.telefono,
              },
            })

            checkout.open(async (result) => {
              const transaction = result.transaction
              if (transaction?.status === 'APPROVED') {
                if (autenticado) {
                  await pagoService.confirmarPago(pedidoRes.id, transaction.id)
                } else {
                  await pagoService.confirmarPagoInvitado(pedidoRes.id, transaction.id)
                }
                limpiarCarrito()
                limpiarBorradorCheckout()
                setPedidoCreado({ ...pedidoRes, metodoPago: 'Tarjeta de Crédito / Débito', total, transaccionId: transaction.id })
              } else if (transaction?.status === 'DECLINED' || transaction?.status === 'ERROR') {
                toastError('El pago fue rechazado por la entidad bancaria. Por favor intenta con otro medio.')
              }
            })
          } catch (widgetErr) {
            console.error('Wompi Widget error:', widgetErr)
            toastError('No se pudo abrir la pasarela de pago segura de Wompi. Por favor verifica si tienes extensiones o bloqueadores de anuncios activos e intenta nuevamente.')
          }
        } else {
          // Si el script de pasarela está bloqueado por adblocker o no cargó
          toastError('El componente de pagos seguros no pudo cargarse en tu navegador (posible bloqueo por extensiones de seguridad o adblockers). Por favor recarga la página o selecciona otro medio de pago.')
        }
      } else if (metodoPago === 'CONTRA_ENTREGA') {
        limpiarCarrito()
        limpiarBorradorCheckout()
        setPedidoCreado({
          ...pedidoRes,
          metodoPago: 'Pago Contra Entrega',
          total,
          instrucciones: pagoRes.instrucciones,
        })
      } else {
        if (autenticado) {
          await pagoService.confirmarPago(pedidoRes.id, pagoRes.referencia || 'TX-SUCCESS-MOCK')
        } else {
          await pagoService.confirmarPagoInvitado(pedidoRes.id, pagoRes.referencia || 'TX-SUCCESS-MOCK')
        }
        limpiarCarrito()
        limpiarBorradorCheckout()
        setPedidoCreado({ ...pedidoRes, metodoPago, total })
      }
    } catch (err) {
      toastError(err.response?.data?.message || err.response?.data?.mensaje || 'Error al procesar la compra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Lock size={20} className="text-emerald-600" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Checkout Seguro</h1>
      </div>

      <form onSubmit={handleProcesarCompra} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Forms column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Banner o Datos de Comprador Invitado */}
          {!autenticado ? (
            <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/80 dark:border-slate-700/60">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Compra Rápida sin Registro
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Solo ingresa tu correo para enviarte el recibo y la guía de tu paquete.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=/checkout')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>¿Ya tienes cuenta? Inicia sesión</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                  Correo Electrónico para Factura y Rastreo *
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={emailInvitado}
                  onChange={(e) => setEmailInvitado(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white shadow-xs"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <span>Comprando como:</span>
                <strong className="font-bold">{usuario?.nombre || usuario?.email}</strong>
                <span className="text-[11px] opacity-75">({usuario?.email})</span>
              </div>
            </div>
          )}

          {/* Step 1: Address */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-white text-sm">
              <MapPin size={18} className="text-indigo-600" />
              <span>1. Dirección de Entrega</span>
            </div>
            <AddressForm direccion={direccion} onChange={setDireccion} />
          </div>

          {/* Step 2: Payment method */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-white text-sm">
              <CreditCard size={18} className="text-indigo-600" />
              <span>2. Método de Pago</span>
            </div>
            <PaymentForm metodoSeleccionado={metodoPago} onSelectMetodo={setMetodoPago} />
          </div>

          {/* Final Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full text-base font-extrabold shadow-xl"
            loading={loading}
          >
            <ShieldCheck size={20} className="mr-2" />
            <span>Confirmar y Pagar Pedido</span>
          </Button>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-4 sticky top-28">
          <CartSummary showCheckoutBtn={false} />
        </div>
      </form>
    </div>
  )
}

export default Checkout
