import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import direccionService from '../services/direccionService'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { User, MapPin, Plus, Trash2, Edit2, Shield } from 'lucide-react'

export const Perfil = () => {
  const { usuario } = useAuth()
  const { success, error } = useToast()
  
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

  useEffect(() => {
    cargarDirecciones()
  }, [])

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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 font-sans pb-16">
      <div className="flex items-center gap-3">
        <User size={32} className="text-mercatto-accent" />
        <h1 className="text-3xl font-black text-slate-800">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
              <User size={48} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{usuario?.nombre || 'Usuario Registrado'}</h2>
            <p className="text-sm text-slate-500 mb-4">{usuario?.email}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <Shield size={14} /> {usuario?.rol || 'COMPRADOR'}
            </span>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Opciones de Cuenta</h3>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
              Cambiar Contraseña
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
              Eliminar Cuenta
            </button>
          </div>
        </div>

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
