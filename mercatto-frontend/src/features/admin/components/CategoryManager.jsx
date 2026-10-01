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
    setLoading(true)
    try {
      if (editando) {
        await adminService.actualizarCategoria(editando.id, { nombre, descripcion, icono, activo: true }, padreId ? Number(padreId) : null)
        success('Categoría actualizada')
      } else {
        await adminService.crearCategoria({ nombre, descripcion, icono, activo: true }, padreId ? Number(padreId) : null)
        success('Categoría creada con éxito')
      }
      setModalAbierto(false)
      cargar()
    } catch (err) {
      error(err.response?.data?.mensaje || 'Error al guardar categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro de eliminar esta categoría?')) return
    try {
      await adminService.eliminarCategoria(id)
      success('Categoría eliminada')
      cargar()
    } catch {
      error('Error al eliminar categoría')
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
