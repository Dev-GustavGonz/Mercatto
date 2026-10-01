import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { direccionService } from '@/features/usuario'
import { usuarioService } from '@/features/usuario'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { User, MapPin, Plus, Trash2, Edit2, Shield, Camera, X, Check } from 'lucide-react'

export const Perfil = () => {
  const { usuario, actualizarUsuario } = useAuth()
  const { success, error, info } = useToast()
  
  const [direcciones, setDirecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [formData, setFormData] = useState({
    calle: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'Colombia',
    esPrincipal: false
  })

  // Perfil Edit State
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [perfilData, setPerfilData] = useState({ nombre: '', telefono: '' })
  const fileInputRef = useRef(null)

  // Password Edit State
  const [modalPassword, setModalPassword] = useState(false)
  const [pwdData, setPwdData] = useState({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' })

  // Delete Account State
  const [modalEliminar, setModalEliminar] = useState(false)

  useEffect(() => {
    cargarDirecciones()
    if (usuario) {
      setPerfilData({ nombre: usuario.nombre || '', telefono: usuario.telefono || '' })
    }
  }, [usuario])

  const cargarDirecciones = async () => {
    try {
      const data = await direccionService.listar()
      setDirecciones(data || [])
    } catch (err) {
      // error handled
    } finally {
      setLoading(false)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      await direccionService.crear(formData)
      success('Dirección guardada correctamente')
      setMostrarForm(false)
      setFormData({ calle: '', ciudad: '', estado: '', codigoPostal: '', pais: 'Colombia', esPrincipal: false })
      cargarDirecciones()
    } catch (err) {
      error('No se pudo guardar la dirección')
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta dirección?')) return
    try {
      await direccionService.eliminar(id)
      success('Dirección eliminada')
      cargarDirecciones()
    } catch (err) {
      error('Error al eliminar')
    }
  }

  const handleGuardarPerfil = async () => {
    try {
      const res = await usuarioService.actualizarPerfil(perfilData)
      if (res.exito) {
        actualizarUsuario(res.usuario)
        setEditandoPerfil(false)
        success('Perfil actualizado')
      }
    } catch (err) {
      error('No se pudo actualizar el perfil')
    }
  }

  const handleSubirFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      error('La imagen no debe superar los 5MB')
      return
    }

    try {
      info('Subiendo foto...')
      const res = await usuarioService.subirFotoPerfil(file)
      if (res.exito) {
        actualizarUsuario(res.usuario)
        success('Foto actualizada')
      }
    } catch (err) {
      error('No se pudo subir la foto')
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    if (pwdData.nuevaPassword !== pwdData.confirmarPassword) {
      return error('Las contraseñas nuevas no coinciden')
    }
    const res = await usuarioService.cambiarPassword(pwdData)
    if (res.exito) {
      success(res.mensaje)
      setModalPassword(false)
      setPwdData({ passwordActual: '', nuevaPassword: '', confirmarPassword: '' })
    } else {
      error(res.mensaje)
    }
  }

  const confirmarEliminarCuenta = async () => {
    const res = await usuarioService.eliminarCuenta()
    if (res.exito) {
      setModalEliminar(false)
      success('Tu cuenta ha sido eliminada correctamente.')
      setTimeout(() => {
        window.location.href = '/' // Logout implícito al borrar cookies o perder acceso
      }, 1500)
    } else {
      error(res.mensaje)
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 font-sans pb-16">
      <div className="flex items-center gap-3">
        <User size={32} className="text-mercatto-accent" />
        <h1 className="text-3xl font-black text-slate-800">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative group">
            {/* Foto de perfil */}
            <div className="relative w-28 h-28 mb-4">
              {usuario?.fotoPerfil ? (
                <img src={usuario.fotoPerfil} alt={usuario.nombre} className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-sm" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-4 border-slate-50 shadow-sm">
                  <User size={48} />
                </div>
              )}
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-mercatto-accent text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleSubirFoto} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
            </div>

            {editandoPerfil ? (
              <div className="w-full space-y-3 mt-2">
                <Input 
                  placeholder="Nombre completo" 
                  value={perfilData.nombre} 
                  onChange={e => setPerfilData({...perfilData, nombre: e.target.value})} 
                />
                <Input 
                  placeholder="Teléfono" 
                  value={perfilData.telefono} 
                  onChange={e => setPerfilData({...perfilData, telefono: e.target.value})} 
                />
                <div className="flex justify-center gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditandoPerfil(false)}>
                    <X size={16} />
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleGuardarPerfil}>
                    <Check size={16} className="mr-1" /> Guardar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
                  {usuario?.nombre || 'Usuario Registrado'}
                  <button onClick={() => setEditandoPerfil(true)} className="text-slate-400 hover:text-mercatto-accent transition-colors cursor-pointer">
                    <Edit2 size={14} />
                  </button>
                </h2>
                <p className="text-sm text-slate-500 mb-1">{usuario?.email}</p>
                {usuario?.telefono && <p className="text-sm text-slate-500 mb-3">{usuario?.telefono}</p>}
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  <Shield size={14} /> {usuario?.rol || 'COMPRADOR'}
                </span>
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Opciones de Cuenta</h3>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer" onClick={() => setModalPassword(true)}>
              Cambiar Contraseña
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer" onClick={() => setModalEliminar(true)}>
              Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* Modal Password */}
        {modalPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Cambiar Contraseña</h3>
              <form onSubmit={handleCambiarPassword} className="space-y-4">
                {usuario?.proveedor !== 'GOOGLE' && (
                  <Input 
                    type="password"
                    label="Contraseña Actual" 
                    value={pwdData.passwordActual} 
                    onChange={e => setPwdData({...pwdData, passwordActual: e.target.value})} 
                    required 
                  />
                )}
                <Input 
                  type="password"
                  label="Nueva Contraseña (Mín. 6 caracteres)" 
                  value={pwdData.nuevaPassword} 
                  onChange={e => setPwdData({...pwdData, nuevaPassword: e.target.value})} 
                  required 
                />
                <Input 
                  type="password"
                  label="Confirmar Nueva Contraseña" 
                  value={pwdData.confirmarPassword} 
                  onChange={e => setPwdData({...pwdData, confirmarPassword: e.target.value})} 
                  required 
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setModalPassword(false)}>Cancelar</Button>
                  <Button type="submit">Actualizar</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Eliminar Cuenta */}
        {modalEliminar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-slate-100 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar Cuenta?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Esta acción no se puede deshacer. Tu cuenta será desactivada permanentemente y perderás acceso a tus pedidos y configuraciones.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmarEliminarCuenta}
                  className="w-full px-4 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer shadow-sm shadow-rose-200"
                >
                  Sí, eliminar mi cuenta
                </button>
                <button 
                  onClick={() => setModalEliminar(false)}
                  className="w-full px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-mercatto-accent" /> Mis Direcciones
              </h2>
              <Button size="sm" onClick={() => setMostrarForm(!mostrarForm)}>
                <Plus size={16} className="mr-1" /> Nueva
              </Button>
            </div>

            {mostrarForm && (
              <form onSubmit={handleCrear} className="bg-mercatto-light p-6 rounded-2xl mb-6 space-y-4 border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm">Agregar Nueva Dirección</h3>
                <Input 
                  label="Calle y número" 
                  value={formData.calle} 
                  onChange={(e) => setFormData({...formData, calle: e.target.value})} 
                  required 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Ciudad" 
                    value={formData.ciudad} 
                    onChange={(e) => setFormData({...formData, ciudad: e.target.value})} 
                    required 
                  />
                  <Input 
                    label="Estado/Provincia" 
                    value={formData.estado} 
                    onChange={(e) => setFormData({...formData, estado: e.target.value})} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Código Postal" 
                    value={formData.codigoPostal} 
                    onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})} 
                  />
                  <Input 
                    label="País" 
                    value={formData.pais} 
                    onChange={(e) => setFormData({...formData, pais: e.target.value})} 
                    required 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Dirección</Button>
                </div>
              </form>
            )}

            {loading ? (
              <p className="text-slate-500 text-sm">Cargando direcciones...</p>
            ) : direcciones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No tienes direcciones guardadas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {direcciones.map((dir) => (
                  <div key={dir.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col relative group hover:border-mercatto-accent transition-colors">
                    {dir.esPrincipal && (
                      <span className="absolute top-0 right-0 bg-mercatto-accent text-white text-[10px] px-2 py-0.5 rounded-bl-lg rounded-tr-xl font-bold">
                        Principal
                      </span>
                    )}
                    <h4 className="font-bold text-slate-800 text-sm">{dir.calle}</h4>
                    <p className="text-slate-500 text-xs mt-1">{dir.ciudad}, {dir.estado} {dir.codigoPostal}</p>
                    <p className="text-slate-500 text-xs">{dir.pais}</p>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <button 
                        onClick={() => handleEliminar(dir.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
