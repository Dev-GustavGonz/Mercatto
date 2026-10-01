import api from '@/utils/api'

export const usuarioService = {
  actualizarPerfil: async (datos) => {
    const res = await api.put('/usuarios/me', datos)
    return res.data
  },

  subirFotoPerfil: async (file) => {
    const formData = new FormData()
    formData.append('archivo', file)
    const res = await api.post('/usuarios/me/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  cambiarPassword: async (datos) => {
    try {
      const res = await api.put('/usuarios/me/password', datos)
      return res.data
    } catch (err) {
      return { exito: false, mensaje: err.response?.data?.mensaje || 'Error al cambiar contraseña' }
    }
  },

  eliminarCuenta: async () => {
    try {
      const res = await api.delete('/usuarios/me')
      return res.data
    } catch (err) {
      return { exito: false, mensaje: err.response?.data?.mensaje || 'Error al eliminar cuenta' }
    }
  }
}

export default usuarioService
