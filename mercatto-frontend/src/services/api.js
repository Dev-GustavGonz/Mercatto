import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  // Necesario para que el navegador mande/reciba la cookie httpOnly del refresh token.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mercatto_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: si el access token expiró (401), pedimos uno nuevo
// usando la cookie httpOnly (no hace falta mandar nada en el body).
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
        if (res.data?.exito && res.data?.accessToken) {
          localStorage.setItem('mercatto_token', res.data.accessToken)
          if (res.data.usuario) localStorage.setItem('mercatto_user', JSON.stringify(res.data.usuario))
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('mercatto_token')
        localStorage.removeItem('mercatto_user')
      }
    }

    return Promise.reject(error)
  }
)

export default api