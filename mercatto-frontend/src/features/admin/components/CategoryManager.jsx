import React, { useState, useEffect } from 'react'
import { adminService } from '@/features/admin'
import { productoService } from '@/features/productos'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import { useToast } from '@/hooks/useToast'
import { Plus, Trash2, Edit } from 'lucide-react'

export const CategoryManager = () => {
  const [categorias, setCategorias] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [icono, setIcono] = useState('Tag')
  const [padreId, setPadreId] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const cargar = () => {
    productoService.listarCategorias().then((data) => setCategorias(data || [])).catch(() => {})
  }

  useEffect(() => {
    cargar()
  }, [])

  const abrirModalCrear = () => {
    setEditando(null)
    setNombre('')
    setDescripcion('')
    setIcono('Tag')
    setPadreId('')
    setModalAbierto(true)
  }

  const abrirModalEditar = (cat) => {
    setEditando(cat)
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion || '')
    setIcono(cat.icono || 'Tag')
    setPadreId(cat.padre?.id || '')
    setModalAbierto(true)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!nombre.trim() || nombre.trim().length < 2) {
      error('El nombre de la categoría debe tener al menos 2 caracteres.')
      return
    }
    if (editando && padreId && Number(padreId) === editando.id) {
      error('Una categoría no puede ser subcategoría de sí misma.')
      return
    }
    setLoading(true)
    try {
      if (editando) {
        await adminService.actualizarCategoria(editando.id, { nombre: nombre.trim(), descripcion: descripcion.trim(), icono: icono.trim() || 'Tag', activo: true }, padreId ? Number(padreId) : null)
        success('Categoría actualizada con éxito')
      } else {
        await adminService.crearCategoria({ nombre: nombre.trim(), descripcion: descripcion.trim(), icono: icono.trim() || 'Tag', activo: true }, padreId ? Number(padreId) : null)
        success('Categoría creada con éxito')
      }
      setModalAbierto(false)
      cargar()
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar categoría'
      error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría? Si contiene productos asociados podría fallar.')) return
    try {
      await adminService.eliminarCategoria(id)
      success('Categoría eliminada con éxito')
      cargar()
    } catch (err) {
      const msg = err.response?.data?.mensaje || err.response?.data?.message || 'Error al eliminar categoría. Verifica que no tenga productos asociados.'
      error(msg)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Gestión de Categorías</h3>
          <p className="text-xs text-slate-500">Organiza las categorías del Marketplace.</p>
        </div>
        <Button variant="primary" size="sm" onClick={abrirModalCrear}>
          <Plus size={14} className="mr-1" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categorias.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.nombre}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-1">{c.descripcion || 'Sin descripción'}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => abrirModalEditar(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer">
                <Edit size={14} />
              </button>
              <button onClick={() => handleEliminar(c.id)} className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal isOpen={true} onClose={() => setModalAbierto(false)} title={editando ? 'Editar Categoría' : 'Nueva Categoría'}>
          <form onSubmit={handleGuardar} className="space-y-4">
            <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <Input label="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            <Input label="Icono Lucide" value={icono} onChange={(e) => setIcono(e.target.value)} placeholder="Ej: Smartphone, Laptop, Shirt" />
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoría Padre (Opcional)
              </label>
              <select
                value={padreId}
                onChange={(e) => setPadreId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Ninguna (Categoría Principal)</option>
                {categorias
                  .filter((c) => !editando || c.id !== editando.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={loading}>Guardar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default CategoryManager
