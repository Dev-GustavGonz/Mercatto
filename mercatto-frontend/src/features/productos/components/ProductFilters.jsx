import React, { useEffect, useState } from 'react'
import { productoService } from '@/features/productos'
import { tiendaService } from '@/features/tiendas'
import Button from '@/components/common/Button'
import { Filter, RotateCcw, Tag, Layers } from 'lucide-react'

export const ProductFilters = ({
  selectedCategory,
  onCategoryChange,
  selectedMarca,
  onMarcaChange,
  priceRange,
  onPriceChange,
  orden,
  onOrdenChange,
  onReset,
}) => {
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [precioMin, setPrecioMin] = useState(priceRange.min || '')
  const [precioMax, setPrecioMax] = useState(priceRange.max || '')

  useEffect(() => {
    productoService.listarCategorias().then((data) => setCategorias(data || [])).catch(() => {})
    tiendaService.listarMarcas().then((data) => setMarcas(data || [])).catch(() => {})
  }, [])

  const handleApplyPrice = (e) => {
    e.preventDefault()
    onPriceChange({ min: precioMin ? Number(precioMin) : null, max: precioMax ? Number(precioMax) : null })
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-sm">
          <Filter size={16} className="text-indigo-600" />
          <span>Filtros Dinámicos</span>
        </div>
        <button
          onClick={() => {
            setPrecioMin('')
            setPrecioMax('')
            onReset()
          }}
          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Limpiar</span>
        </button>
      </div>

      {/* Ordenamiento */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Ordenar Por
        </label>
        <select
          value={orden}
          onChange={(e) => onOrdenChange(e.target.value)}
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="recientes">Más recientes</option>
          <option value="precio_asc">Menor precio</option>
          <option value="precio_desc">Mayor precio</option>
          <option value="calificacion">Mejor valorados</option>
          <option value="ventas">Más vendidos</option>
        </select>
      </div>

      {/* Categorías Dinámicas */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
          <Layers size={13} className="text-indigo-500" />
          <span>Categorías ({categorias.length})</span>
        </label>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              !selectedCategory
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Todas las categorías
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                String(selectedCategory) === String(cat.id)
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Marcas Dinámicas */}
      {marcas && marcas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Tag size={13} className="text-indigo-500" />
              <span>Marcas Oficiales ({marcas.length})</span>
            </label>
            {selectedMarca && (
              <button
                onClick={() => onMarcaChange('')}
                className="text-[10px] text-indigo-600 hover:underline font-semibold"
              >
                Todas
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onMarcaChange('')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                !selectedMarca
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Todas las marcas
            </button>
            {marcas.map((m) => (
              <button
                key={m}
                onClick={() => onMarcaChange(selectedMarca === m ? '' : m)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                  selectedMarca === m
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{m}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rango de Precios */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Rango de Precio
        </label>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Mínimo"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Máximo"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="w-full text-xs">
            Aplicar Filtro
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ProductFilters
