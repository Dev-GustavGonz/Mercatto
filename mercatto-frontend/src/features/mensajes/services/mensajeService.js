import api from '@/utils/api'

const mensajeService = {
  obtenerContactos: async () => {
    const res = await api.get('/mensajes/contactos')
    return res.data
  },

  obtenerConversacion: async (otroUsuarioId, remitenteId = null) => {
    const params = remitenteId ? { remitenteId } : {}
    const res = await api.get(`/mensajes/conversacion/${otroUsuarioId}`, { params })
    return res.data
  },

  enviarMensaje: async (datos) => {
    const res = await api.post('/mensajes', datos)
    return res.data
  },

  recargarTokens: async (cantidad) => {
    const res = await api.post(`/mensajes/tokens/recargar?cantidad=${cantidad}`)
    return res.data
  },

  obtenerSaldoTokens: async () => {
    const res = await api.get('/mensajes/tokens/saldo')
    return res.data
  },

  obtenerNoLeidos: async () => {
    const res = await api.get('/mensajes/no-leidos')
    return res.data
  }
}

export default mensajeService
