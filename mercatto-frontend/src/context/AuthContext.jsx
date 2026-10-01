import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../features/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    try {
      const u = localStorage.getItem('mercatto_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('mercatto_token') || null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      const storedToken = localStorage.getItem('mercatto_token')

      if (storedToken) {
        // Ya hay un access token en esta pestaña: solo confirmamos que siga vigente.
        try {
          const me = await authService.getMe()
          if (me?.exito) {
            setUsuario((prev) => ({
              ...prev,
              email: me.email,
              rol: me.rol?.replace('ROLE_', ''),
            }))
          }
        } catch {
          // Token inválido, intentamos refrescar más abajo con la cookie
        }
      } else {
        // No hay access token (pestaña nueva / navegador reabierto): si el usuario
        // marcó "Recordarme", la cookie httpOnly sigue viva y podemos restaurar la sesión sin pedirle nada.
        try {
          const res = await authService.refrescarSesion()
          if (res?.exito && res?.accessToken) {
            localStorage.setItem('mercatto_token', res.accessToken)
            if (res.usuario) localStorage.setItem('mercatto_user', JSON.stringify(res.usuario))
            setToken(res.accessToken)
            setUsuario(res.usuario)
          }
        } catch {
          // No hay cookie o ya expiró: sigue deslogueado, normal.
        }
      }
      setCargando(false)
    }
    verificarSesion()
  }, [])

  const login = async (email, password, recordarme = false) => {
    const res = await authService.login(email, password, recordarme)
    if (res?.exito && res?.accessToken) {
      localStorage.setItem('mercatto_token', res.accessToken)
      localStorage.setItem('mercatto_user', JSON.stringify(res.usuario))
      setToken(res.accessToken)
      setUsuario(res.usuario)
      return { exito: true, usuario: res.usuario }
    }
    return { exito: false, mensaje: res?.mensaje || 'Error al iniciar sesión', pendiente: res?.pendiente }
  }

  const loginGoogle = async (credential) => {
    try {
      const res = await authService.loginGoogle(credential)
      if (res?.exito && res?.accessToken) {
        localStorage.setItem('mercatto_token', res.accessToken)
        localStorage.setItem('mercatto_user', JSON.stringify(res.usuario))
        setToken(res.accessToken)
        setUsuario(res.usuario)
        return { exito: true, usuario: res.usuario }
      }
      return { exito: false, mensaje: res?.mensaje || 'No se pudo iniciar sesión con Google', pendiente: res?.pendiente }
    } catch (err) {
      return {
        exito: false,
        mensaje: err?.response?.data?.mensaje || 'No se pudo iniciar sesión con Google',
      }
    }
  }

  const registro = async (datos) => {
    const res = await authService.registro(datos)
    if (res?.exito && res?.accessToken) {
      localStorage.setItem('mercatto_token', res.accessToken)
      localStorage.setItem('mercatto_user', JSON.stringify(res.usuario))
      setToken(res.accessToken)
      setUsuario(res.usuario)
      return { exito: true, usuario: res.usuario }
    }
    return {
      exito: res?.exito || false,
      mensaje: res?.mensaje || 'Error en el registro',
      pendiente: res?.pendiente || false,
    }
  }

  const logout = async () => {
    await authService.logout()
    setToken(null)
    setUsuario(null)
  }

  const esComprador = usuario?.rol === 'COMPRADOR'
  const esVendedor = usuario?.rol === 'VENDEDOR'
  const esAdmin = usuario?.rol === 'ADMIN'

  const actualizarUsuario = (nuevosDatos) => {
    setUsuario((prev) => {
      const actualizado = { ...prev, ...nuevosDatos }
      localStorage.setItem('mercatto_user', JSON.stringify(actualizado))
      return actualizado
    })
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        autenticado: !!token && !!usuario,
        esComprador,
        esVendedor,
        esAdmin,
        login,
        loginGoogle,
        registro,
        logout,
        actualizarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}
