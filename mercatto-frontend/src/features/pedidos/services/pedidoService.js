import api from '@/utils/api'

export const pedidoService = {
  crearPedido: async (datos) => {
    const res = await api.post('/pedidos', datos)
    return res.data
  },

  misPedidos: async (params = {}) => {
    const res = await api.get('/pedidos/mis-pedidos', { params })
    return res.data
  },

  obtenerPorId: async (id) => {
    const res = await api.get(`/pedidos/${id}`)
    return res.data
  },

  pedidosVendedor: async (params = {}) => {
    const res = await api.get('/pedidos/vendedor', { params })
    return res.data
  },

  actualizarEstado: async (id, datos) => {
    const res = await api.patch(`/pedidos/${id}/estado`, datos)
    return res.data
  },

  validarCupon: async (codigo, subtotal) => {
    const res = await api.post('/cupones/validar', { codigo, subtotal })
    return res.data
  },
}

export default pedidoService
