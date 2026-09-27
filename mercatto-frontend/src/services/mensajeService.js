import api from './api'

const mensajeService = {
  obtenerContactos: async () => {
    const res = await api.get('/mensajes/contactos')
    return res.data
  },

  obtenerConversacion: async (otroUsuarioId) => {
    const res = await api.get(`/mensajes/conversacion/${otroUsuarioId}`)
    return res.data
  },

  enviarMensaje: async (datos) => {
    const res = await api.post('/mensajes', datos)
    return res.data
  },

  recargarTokens: async (cantidad) => {
    const res = await api.post(`/mensajes/tokens/recargar?cantidad=${cantidad}`)
    return res.data
  }
}

export default mensajeService
