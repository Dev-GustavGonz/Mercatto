import api from '@/utils/api'

export const pagoService = {
  iniciarPago: async (pedidoId, metodo = 'STRIPE') => {
    const res = await api.post('/pagos/iniciar', { pedidoId, metodo })
    return res.data
  },

  iniciarPagoInvitado: async (pedidoId, metodo = 'WOMPI') => {
    const res = await api.post('/pagos/iniciar-invitado', { pedidoId, metodo })
    return res.data
  },

  confirmarPago: async (pedidoId, transaccionId) => {
    const res = await api.post('/pagos/confirmar', { pedidoId, transaccionId })
    return res.data
  },

  confirmarPagoInvitado: async (pedidoId, transaccionId) => {
    const res = await api.post('/pagos/confirmar-invitado', { pedidoId, transaccionId })
    return res.data
  },
}

export default pagoService
