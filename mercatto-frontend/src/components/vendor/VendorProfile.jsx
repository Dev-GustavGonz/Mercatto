import React, { useState, useRef, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import vendedorService from '../../services/vendedorService'
import { useToast } from '../../hooks/useToast'
import { Upload, Image as ImageIcon, Trash2, Camera } from 'lucide-react'
import { getMediaUrl } from '../../utils/constants'

export const VendorProfile = ({ perfil, onActualizado, onPerfilActualizado }) => {
  const [nombreTienda, setNombreTienda] = useState(perfil?.nombreTienda || '')
  const [descripcion, setDescripcion] = useState(perfil?.descripcion || '')
  const [logoUrl, setLogoUrl] = useState(perfil?.logoUrl || '')
  const [portadaUrl, setPortadaUrl] = useState(perfil?.portadaUrl || '')
  const [ciudad, setCiudad] = useState(perfil?.ciudad || '')
  const [direccion, setDireccion] = useState(perfil?.direccion || '')
  const [cuentaBancaria, setCuentaBancaria] = useState(perfil?.cuentaBancaria || '')
  const [banco, setBanco] = useState(perfil?.banco || '')
  const [loading, setLoading] = useState(false)
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const [subiendoPortada, setSubiendoPortada] = useState(false)

  // Sincronizar estado cuando se cargue o actualice el perfil
  useEffect(() => {
    if (perfil) {
      setNombreTienda(perfil.nombreTienda || '')
      setDescripcion(perfil.descripcion || '')
      setLogoUrl(perfil.logoUrl || '')
      setPortadaUrl(perfil.portadaUrl || '')
      setCiudad(perfil.ciudad || '')
      setDireccion(perfil.direccion || '')
      setCuentaBancaria(perfil.cuentaBancaria || '')
      setBanco(perfil.banco || '')
    }
  }, [perfil])

  const logoInputRef = useRef(null)
  const portadaInputRef = useRef(null)
  const { success, error } = useToast()

  const defaultPortada = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80'
  const defaultLogo = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=150&auto=format&fit=crop&q=80'

  const handleSubirLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoLogo(true)
    try {
      const res = await vendedorService.subirImagen(file)
      if (res?.url) {
        setLogoUrl(res.url)
        success('¡Logo subido exitosamente!')
      }
    } catch {
      error('Error al subir el logo')
    } finally {
      setSubiendoLogo(false)
    }
  }

  const handleSubirPortada = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoPortada(true)
    try {
      const res = await vendedorService.subirImagen(file)
      if (res?.url) {
        setPortadaUrl(res.url)
        success('¡Portada subida exitosamente!')
      }
    } catch {
      error('Error al subir la portada')
    } finally {
      setSubiendoPortada(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await vendedorService.actualizarPerfil({
        nombreTienda,
        descripcion,
        logoUrl,
        portadaUrl,
        ciudad,
        direccion,
        cuentaBancaria,
        banco,
      })
      success('¡Perfil e imágenes de tu tienda actualizados con éxito!')
      if (onActualizado) onActualizado()
      if (onPerfilActualizado) onPerfilActualizado()
    } catch {
      error('Error al actualizar datos de la tienda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm">
      <div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Identidad Visual y Datos de tu Tienda</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Personaliza cómo los clientes verán tu marca en el directorio oficial y en tu vitrina pública.
        </p>
      </div>

      {/* Previsualizador en tiempo real */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Vista previa en vivo para tus clientes
        </label>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-inner">
          <div className="relative h-32 sm:h-40 bg-slate-900 overflow-hidden">
            <img
              src={getMediaUrl(portadaUrl, defaultPortada)}
              alt="Portada de tienda"
              onError={(e) => { e.target.src = defaultPortada }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-black/20" />
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-bold backdrop-blur-sm shadow">
              {ciudad || 'Colombia'}
            </span>
          </div>
          <div className="px-5 pb-5 pt-0 flex items-end gap-4 relative">
            <div className="-mt-8 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl border-2 border-white dark:border-slate-800 overflow-hidden shrink-0 z-10">
              <img
                src={getMediaUrl(logoUrl, defaultLogo)}
                alt="Logo tienda"
                onError={(e) => { e.target.src = defaultLogo }}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="pt-2 min-w-0 flex-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                {nombreTienda || 'Nombre de tu Tienda'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {descripcion || 'Agrega una breve descripción de tus productos o servicios...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Imágenes: Subida directa de archivos o URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* LOGO */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera size={14} className="text-indigo-600" />
              <span>Logo de la Tienda</span>
            </label>
            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              onChange={handleSubirLogo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={subiendoLogo}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-indigo-200/50 cursor-pointer transition"
            >
              <Upload size={13} />
              <span>{subiendoLogo ? 'Subiendo archivo...' : 'Subir archivo desde PC'}</span>
            </button>
          </div>

          <Input
            label=""
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="O escribe la URL del logo: https://..."
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>PNG, JPG, WEBP • Cuadrado (500x500)</span>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 size={11} /> Quitar
              </button>
            )}
          </div>
        </div>

        {/* PORTADA / BANNER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-indigo-600" />
              <span>Banner de Portada</span>
            </label>
            <input
              type="file"
              ref={portadaInputRef}
              accept="image/*"
              onChange={handleSubirPortada}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => portadaInputRef.current?.click()}
              disabled={subiendoPortada}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-indigo-200/50 cursor-pointer transition"
            >
              <Upload size={13} />
              <span>{subiendoPortada ? 'Subiendo archivo...' : 'Subir archivo desde PC'}</span>
            </button>
          </div>

          <Input
            label=""
            value={portadaUrl}
            onChange={(e) => setPortadaUrl(e.target.value)}
            placeholder="O escribe la URL del banner: https://..."
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>PNG, JPG, WEBP • Horizontal (1200x400)</span>
            {portadaUrl && (
              <button
                type="button"
                onClick={() => setPortadaUrl('')}
                className="text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Trash2 size={11} /> Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Input
          label="Nombre Comercial de la Tienda"
          value={nombreTienda}
          onChange={(e) => setNombreTienda(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Descripción de la Tienda y Especialidad
          </label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuenta a los clientes sobre tu experiencia, tipo de productos y garantía..."
            className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ciudad de Despacho"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          placeholder="Ej: Bogotá, Medellín, Cali..."
        />
        <Input
          label="Dirección Física del Almacén / Oficina"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ej: Calle 100 #15-20 Bodega 4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Input
          label="Banco para Liquidaciones de Venta"
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          placeholder="Ej: Bancolombia, Davivienda, Nequi"
        />
        <Input
          label="Número de Cuenta o Celular Nequi/Daviplata"
          value={cuentaBancaria}
          onChange={(e) => setCuentaBancaria(e.target.value)}
          placeholder="Ej: 123-456789-00"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={loading} className="px-6 py-2.5 rounded-xl font-bold">
          Guardar Cambios de Tienda
        </Button>
      </div>
    </form>
  )
}

export default VendorProfile
