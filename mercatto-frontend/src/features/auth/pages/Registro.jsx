import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import GoogleLoginButton from '../components/GoogleLoginButton'
import { User, Mail, Lock, Store, Building, MapPin } from 'lucide-react'

export const Registro = () => {
  const [searchParams] = useSearchParams()
  const rolInicial = searchParams.get('rol') === 'VENDEDOR' ? 'VENDEDOR' : 'COMPRADOR'

  const [rol, setRol] = useState(rolInicial)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Campos Vendedor
  const [nombreTienda, setNombreTienda] = useState('')
  const [nitCedula, setNitCedula] = useState('')
  const [ciudad, setCiudad] = useState('')

  const [loading, setLoading] = useState(false)
  const { registro, loginGoogle } = useAuth()
  const { success, error, info } = useToast()
  const navigate = useNavigate()

  const handleGoogle = async (credential) => {
    setLoading(true)
    const res = await loginGoogle(credential)
    setLoading(false)

    if (res?.exito) {
      success('¡Cuenta creada con Google! Bienvenido a Mercatto.')
      navigate('/')
    } else {
      error(res?.mensaje || 'No se pudo continuar con Google')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      nombre,
      email: email.trim(),
      password,
      rol,
      vendedor:
        rol === 'VENDEDOR'
          ? {
              nombreTienda,
              nitCedula,
              ciudad,
              tipo: 'PERSONA_NATURAL',
            }
          : null,
    }

    const res = await registro(payload)
    setLoading(false)

    if (res?.exito) {
      if (res?.pendiente) {
        info('¡Registro enviado! Tu cuenta de vendedor está en revisión por un administrador.')
        navigate('/login')
      } else {
        success('¡Cuenta creada exitosamente! Bienvenido a Mercatto.')
        window.location.replace('/')
      }
    } else {
      error(res?.mensaje || 'Error en el registro')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <span className="text-2xl font-black text-indigo-600">MERCATTO</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Crear una Cuenta</h2>
          <p className="text-xs text-slate-500">Únete como comprador o como proveedor/vendedor</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setRol('COMPRADOR')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              rol === 'COMPRADOR'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={15} />
            <span>Soy Comprador</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('VENDEDOR')}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              rol === 'VENDEDOR'
                ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Store size={15} />
            <span>Soy Proveedor / Vendedor</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo o Razón Social"
            placeholder="Ej: Laura Gómez"
            icon={User}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

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
            placeholder="Mínimo 6 caracteres"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {rol === 'VENDEDOR' && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-4">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Información del Negocio / Proveedor
              </span>

              <Input
                label="Nombre de tu Tienda Virtual"
                placeholder="Ej: Calzado & Modas Medellín"
                icon={Store}
                value={nombreTienda}
                onChange={(e) => setNombreTienda(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="NIT o Cédula"
                  placeholder="Ej: 900.123.456-7"
                  icon={Building}
                  value={nitCedula}
                  onChange={(e) => setNitCedula(e.target.value)}
                  required
                />
                <Input
                  label="Ciudad"
                  placeholder="Ej: Bogotá, Cali, Medellín"
                  icon={MapPin}
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold" loading={loading}>
            {rol === 'VENDEDOR' ? 'Enviar Solicitud de Tienda' : 'Crear Cuenta de Comprador'}
          </Button>
        </form>

        {rol === 'COMPRADOR' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400">o</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <GoogleLoginButton onCredential={handleGoogle} texto="signup_with" />
          </>
        )}

        <div className="text-center pt-2 text-xs text-slate-500">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Registro
