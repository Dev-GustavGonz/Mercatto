import api from '@/utils/api'

export const authService = {
  login: async (email, password, recordarme = false) => {
    const res = await api.post('/auth/login', { email, password, recordarme })
    return res.data
  },

  registro: async (datos) => {
    const res = await api.post('/auth/registro', datos)
    return res.data
  },

  // credential = el ID Token (JWT) que entrega Google Identity Services
  loginGoogle: async (credential) => {
    const res = await api.post('/auth/google', { credential })
    return res.data
  },

  // Intenta restaurar la sesión usando la cookie httpOnly del refresh token.
  // Si no hay cookie (o expiró), simplemente falla y el usuario queda deslogueado.
  refrescarSesion: async () => {
    const res = await api.post('/auth/refresh')
    return res.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('mercatto_token')
      localStorage.removeItem('mercatto_user')
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },
}

export default authService
