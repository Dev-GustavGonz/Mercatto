import api from './api'

export const vendedorService = {
  obtenerPerfil: async () => {
    const res = await api.get('/vendedor/perfil')
    return res.data
  },

  actualizarPerfil: async (datos) => {
    const res = await api.put('/vendedor/perfil', datos)
    return res.data
  },

  obtenerEstadisticas: async () => {
    const res = await api.get('/vendedor/stats')
    return res.data
  },

  obtenerMisProductos: async (params = {}) => {
    const res = await api.get('/vendedor/productos', { params })
    return res.data
  },

  bandejaMensajes: async (params = {}) => {
    const res = await api.get('/mensajes/bandeja-vendedor', { params })
    return res.data
  },

  marcarMensajeLeido: async (id) => {
    const res = await api.patch(`/mensajes/${id}/leido`)
    return res.data
  },

  subirImagen: async (file) => {
    const formData = new FormData()
    formData.append('archivo', file)
    const res = await api.post('/productos/subir-imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  actualizarSuscripcion: async (plan) => {
    const res = await api.post('/vendedor/suscripcion', { plan })
    return res.data
  },
}

export default vendedorService
