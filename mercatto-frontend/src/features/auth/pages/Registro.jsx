import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import GoogleLoginButton from '../components/GoogleLoginButton'
import MercattoLogo from '@/components/common/MercattoLogo'
import { User, Mail, Lock, Store, Building, MapPin, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export const Registro = () => {
  const [searchParams] = useSearchParams()
  const rolInicial = searchParams.get('rol') === 'VENDEDOR' ? 'VENDEDOR' : 'COMPRADOR'

  const [rol, setRol] = useState(rolInicial)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      window.location.replace('/')
    } else {
      error(res?.mensaje || 'No se pudo continuar con Google')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nombreTrim = nombre.trim()
    const emailTrim = email.trim()

    if (!nombreTrim) {
      error('Por favor ingresa tu nombre completo')
      return
    }

    if (!emailTrim || !/\S+@\S+\.\S+/.test(emailTrim)) {
      error('Por favor ingresa un correo electrónico válido')
      return
    }

    if (password.length < 6) {
      error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      error('Las contraseñas no coinciden. Por favor verifícalas.')
      return
    }

    if (rol === 'VENDEDOR') {
      if (!nombreTienda.trim()) {
        error('Por favor ingresa el nombre de tu tienda')
        return
      }
      if (!nitCedula.trim()) {
        error('Por favor ingresa el NIT o Cédula de tu negocio')
        return
      }
      if (!ciudad.trim()) {
        error('Por favor ingresa la ciudad de tu negocio en Colombia')
        return
      }
    }

    setLoading(true)

    const payload = {
      nombre: nombreTrim,
      email: emailTrim,
      password,
      rol,
      vendedor:
        rol === 'VENDEDOR'
          ? {
              nombreTienda: nombreTienda.trim(),
              nitCedula: nitCedula.trim(),
              ciudad: ciudad.trim(),
              tipo: 'PERSONA_NATURAL',
            }
          : null,
    }

    const res = await registro(payload)
    setLoading(false)

    if (res?.exito) {
      if (rol === 'VENDEDOR') {
        info('¡Solicitud enviada! Tu cuenta de vendedor está en revisión por el administrador.')
        navigate('/login')
      } else {
        success('¡Cuenta creada exitosamente! Bienvenido a Mercatto.')
        window.location.replace('/')
      }
    } else {
      error(res?.mensaje || 'Error al procesar el registro. Intenta nuevamente.')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-violet-500/5 space-y-6">
        
        {/* Cabecera Oficial Mercatto con el logo estilizado */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex justify-center transition-transform hover:scale-105" title="Volver al inicio">
            <MercattoLogo className="text-3xl sm:text-4xl" />
          </Link>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Crear una Cuenta
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Únete a Mercatto como comprador o como proveedor/vendedor oficial
          </p>
        </div>

        {/* Pestañas de Selección de Rol (Comprador vs Vendedor) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setRol('COMPRADOR')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rol === 'COMPRADOR'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <User size={15} />
            <span>Soy Comprador</span>
          </button>

          <button
            type="button"
            onClick={() => setRol('VENDEDOR')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              rol === 'VENDEDOR'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Store size={15} />
            <span>Soy Proveedor / Vendedor</span>
          </button>
        </div>

        {/* Formulario de Registro con validaciones completas */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre Completo o Titular"
            placeholder="Ej: Fernando Barboza"
            icon={User}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@mercatto.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar' : 'Ver'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Input
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Ocultar' : 'Ver'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Información adicional obligatoria para Vendedores */}
          {rol === 'VENDEDOR' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Store size={15} />
                <span>Datos del Negocio / Tienda Oficial</span>
              </div>

              <Input
                label="Nombre de tu Tienda Virtual"
                placeholder="Ej: Alien Tech Colombia"
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
                  label="Ciudad en Colombia"
                  placeholder="Ej: Bogotá, Medellín, Cali"
                  icon={MapPin}
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className={`w-full font-bold shadow-lg mt-2 ${
              rol === 'VENDEDOR'
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/25'
            }`} 
            loading={loading}
          >
            {rol === 'VENDEDOR' ? 'Enviar Solicitud de Tienda' : 'Crear Cuenta en Mercatto'}
          </Button>
        </form>

        {rol === 'COMPRADOR' && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 font-medium">o regístrate con</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <GoogleLoginButton onCredential={handleGoogle} texto="signup_with" />
          </>
        )}

        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          ¿Ya tienes una cuenta registrada?{' '}
          <Link to="/login" className="font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Registro
