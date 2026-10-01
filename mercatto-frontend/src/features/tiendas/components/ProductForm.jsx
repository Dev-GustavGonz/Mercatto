import React, { useState, useEffect } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { productoService } from '@/features/productos'
import { useToast } from '@/hooks/useToast'
import { Plus, Trash2, Upload } from 'lucide-react'

export const ProductForm = ({ productoInicial = null, onGuardado, onCancelar }) => {
  const [titulo, setTitulo] = useState(productoInicial?.titulo || '')
  const [categoriaId, setCategoriaId] = useState(productoInicial?.categoria?.id || '')
  const [descripcion, setDescripcion] = useState(productoInicial?.descripcion || '')
  const [precio, setPrecio] = useState(productoInicial?.precio || '')
  const [precioOferta, setPrecioOferta] = useState(productoInicial?.precioOferta || '')
  const [stock, setStock] = useState(productoInicial?.stock || 10)
  const [marca, setMarca] = useState(productoInicial?.marca || '')
  const [estado, setEstado] = useState(productoInicial?.estado || 'NUEVO')
  const [destacado, setDestacado] = useState(productoInicial?.destacado || false)
  const [imagenes, setImagenes] = useState(productoInicial?.imagenes?.map(i => i.url) || [''])
  const [variantes, setVariantes] = useState(
    productoInicial?.variantes || []
  )
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    productoService.listarCategorias().then((data) => setCategorias(data || [])).catch(() => {})
  }, [])

  const handleAddImageUrl = () => setImagenes([...imagenes, ''])
  const handleRemoveImage = (idx) => setImagenes(imagenes.filter((_, i) => i !== idx))
  const handleImageChange = (idx, val) => {
    const list = [...imagenes]
    list[idx] = val
    setImagenes(list)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSubiendoImg(true)
    try {
      const res = await productoService.subirImagen(file)
      if (res?.url) {
        setImagenes([...imagenes.filter(Boolean), res.url])
        success('Imagen subida con éxito')
      }
    } catch {
      error('Error al subir la imagen')
    } finally {
      setSubiendoImg(false)
    }
  }

  const handleAddVariante = () => {
    setVariantes([...variantes, { nombre: '', precio: Number(precio) || 0, stock: 5 }])
  }

  const handleRemoveVariante = (idx) => {
    setVariantes(variantes.filter((_, i) => i !== idx))
  }

  const handleVarianteChange = (idx, field, val) => {
    const list = [...variantes]
    list[idx] = { ...list[idx], [field]: val }
    setVariantes(list)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!categoriaId) {
      error('Selecciona una categoría para el producto')
      return
    }

    const precioNum = Number(precio)
    const precioOfertaNum = precioOferta ? Number(precioOferta) : null
    const stockNum = Number(stock)

    if (isNaN(precioNum) || precioNum <= 0) {
      error('El precio normal debe ser un valor mayor a 0')
      return
    }

    if (precioOfertaNum !== null) {
      if (isNaN(precioOfertaNum) || precioOfertaNum <= 0) {
        error('El precio de oferta debe ser mayor a 0')
        return
      }
      if (precioOfertaNum >= precioNum) {
        error('El precio de oferta debe ser menor que el precio regular')
        return
      }
    }

    if (isNaN(stockNum) || stockNum < 0) {
      error('El stock disponible no puede ser negativo')
      return
    }

    setLoading(true)
    const payload = {
      titulo: titulo.trim(),
      categoriaId: Number(categoriaId),
      descripcion: descripcion.trim(),
      precio: precioNum,
      precioOferta: precioOfertaNum,
      stock: stockNum,
      marca: marca?.trim() || null,
      estado,
      destacado,
      activo: productoInicial ? (productoInicial.activo ?? true) : true,
      imagenes: imagenes.filter(Boolean).map((url, i) => ({
        url,
        principal: i === 0,
        ordenVisual: i,
      })),
      variantes: variantes.filter(v => v.nombre.trim()).map(v => ({
        nombre: v.nombre,
        precio: Number(v.precio) || Number(precio),
        stock: Number(v.stock) || 0,
      })),
    }

    try {
      if (productoInicial?.id) {
        await productoService.actualizar(productoInicial.id, payload)
        success('Producto actualizado exitosamente')
      } else {
        await productoService.crear(payload)
        success('¡Producto publicado exitosamente!')
      }
      if (onGuardado) onGuardado()
    } catch (err) {
      error(err.response?.data?.mensaje || 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {productoInicial ? 'Editar Producto' : 'Publicar Nuevo Producto'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Título del Producto"
          placeholder="Ej: Auriculares Inalámbricos Bluetooth 5.3"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Categoría
          </label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Selecciona una categoría...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Descripción Detallada
        </label>
        <textarea
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe las características técnicas, estado, garantía y uso del producto..."
          className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Input
          label="Precio Normal (COP)"
          type="number"
          placeholder="Ej: 150000"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
        <Input
          label="Precio Oferta (opcional)"
          type="number"
          placeholder="Ej: 120000"
          value={precioOferta}
          onChange={(e) => setPrecioOferta(e.target.value)}
        />
        <Input
          label="Stock disponible"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <Input
          label="Marca"
          placeholder="Ej: Sony, Samsung, Genérica"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
        />
      </div>

      {/* Imágenes */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Imágenes del Producto (URLs o subida)
          </label>
          <label className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
            <Upload size={14} />
            <span>{subiendoImg ? 'Subiendo...' : 'Subir Imagen'}</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {imagenes.map((url, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              placeholder="https://ejemplo.com/foto.jpg"
              value={url}
              onChange={(e) => handleImageChange(idx, e.target.value)}
              className="flex-1 text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
            {imagenes.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddImageUrl}
          className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> <span>Agregar otra URL</span>
        </button>
      </div>

      {/* Variantes */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Variantes (Tallas, Colores, etc.)
          </label>
          <button
            type="button"
            onClick={handleAddVariante}
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> <span>Añadir Variante</span>
          </button>
        </div>

        {variantes.map((v, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <input
              type="text"
              placeholder="Nombre (ej: Talla M / Azul)"
              value={v.nombre}
              onChange={(e) => handleVarianteChange(idx, 'nombre', e.target.value)}
              className="sm:col-span-2 text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <input
              type="number"
              placeholder="Precio"
              value={v.precio}
              onChange={(e) => handleVarianteChange(idx, 'precio', e.target.value)}
              className="text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => handleVarianteChange(idx, 'stock', e.target.value)}
                className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariante(idx)}
                className="text-rose-500 p-1 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {onCancelar && (
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {productoInicial ? 'Guardar Cambios' : 'Publicar Producto'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
