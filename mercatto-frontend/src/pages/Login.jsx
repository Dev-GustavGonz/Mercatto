import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import GoogleLoginButton from '../components/common/GoogleLoginButton'
import { Mail, Lock, LogIn } from 'lucide-react'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordarme, setRecordarme] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, loginGoogle } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  const irSegunRol = (res) => {
    if (res.usuario?.rol === 'VENDEDOR') {
      navigate('/vendedor')
    } else if (res.usuario?.rol === 'ADMIN') {
      navigate('/admin')
    } else {
      navigate(redirectUrl)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email.trim(), password, recordarme)
    setLoading(false)

    if (res?.exito) {
      success('¡Bienvenido de vuelta a Mercatto!')
      irSegunRol(res)
    } else {
      error(res?.mensaje || 'Error al iniciar sesión')
    }
  }

  const handleGoogle = async (credential) => {
    setLoading(true)
    const res = await loginGoogle(credential)
    setLoading(false)

    if (res?.exito) {
      success('¡Bienvenido a Mercatto!')
      irSegunRol(res)
    } else {
      error(res?.mensaje || 'No se pudo iniciar sesión con Google')
    }
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <span className="text-2xl font-black text-indigo-600">MERCATTO</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500">Ingresa con tu correo y contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="tu@correo.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Recordarme
          </label>

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold" loading={loading}>
            <LogIn size={18} className="mr-2" />
            <span>Ingresar</span>
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400">o</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <GoogleLoginButton onCredential={handleGoogle} texto="signin_with" />

        <div className="text-center pt-2 text-xs text-slate-500">
          ¿No tienes una cuenta aún?{' '}
          <Link to="/registro" className="font-bold text-indigo-600 hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
