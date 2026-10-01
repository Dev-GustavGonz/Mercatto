import api from '@/utils/api'

export const productoService = {
  listar: async (params = {}) => {
    const res = await api.get('/productos', { params })
    return res.data
  },

  obtenerDestacados: async () => {
    const res = await api.get('/productos/destacados')
    return res.data
  },

  obtenerNuevos: async () => {
    const res = await api.get('/productos/nuevos')
    return res.data
  },

  obtenerPorId: async (id) => {
    const res = await api.get(`/productos/${id}`)
    return res.data
  },

  obtenerPorSlug: async (slug) => {
    const res = await api.get(`/productos/slug/${slug}`)
    return res.data
  },

  listarCategorias: async () => {
    const res = await api.get('/categorias')
    return res.data
  },

  crear: async (datos) => {
    const res = await api.post('/productos', datos)
    return res.data
  },

  actualizar: async (id, datos) => {
    const res = await api.put(`/productos/${id}`, datos)
    return res.data
  },

  eliminar: async (id) => {
    const res = await api.delete(`/productos/${id}`)
    return res.data
  },

  toggleActivo: async (id) => {
    const res = await api.patch(`/productos/${id}/toggle-activo`)
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

  // Contactar al Vendedor
  enviarMensajeContacto: async (productoId, mensaje, asunto = 'Consulta sobre el producto') => {
    const res = await api.post('/mensajes/contacto', { productoId, mensaje, asunto })
    return res.data
  },

  obtenerConversacion: async (productoId) => {
    const res = await api.get(`/mensajes/producto/${productoId}`)
    return res.data
  },

  // Reseñas
  obtenerResenas: async (productoId, params = {}) => {
    const res = await api.get(`/resenas/producto/${productoId}`, { params })
    return res.data
  },

  crearResena: async (datos) => {
    const res = await api.post('/resenas', datos)
    return res.data
  },

  // Favoritos
  toggleFavorito: async (productoId) => {
    const res = await api.post(`/favoritos/${productoId}`)
    return res.data
  },

  listarFavoritos: async (params = {}) => {
    const res = await api.get('/favoritos', { params })
    return res.data
  },
}

export default productoService
