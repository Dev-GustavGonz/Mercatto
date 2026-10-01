import api from '@/utils/api'

export const direccionService = {
  listar: async () => {
    const res = await api.get('/direcciones')
    return res.data
  },
  crear: async (datos) => {
    const res = await api.post('/direcciones', datos)
    return res.data
  },
  actualizar: async (id, datos) => {
    const res = await api.put(`/direcciones/${id}`, datos)
    return res.data
  },
  eliminar: async (id) => {
    const res = await api.delete(`/direcciones/${id}`)
    return res.data
  }
}

export default direccionService
