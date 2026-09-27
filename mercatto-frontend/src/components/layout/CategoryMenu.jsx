import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import productoService from '../../services/productoService'
import { Grid, ChevronRight } from 'lucide-react'

export const CategoryMenu = () => {
  const [categorias, setCategorias] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    productoService.listarCategorias().then((data) => {
      setCategorias(data || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="relative group" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-mercatto-accent text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:shadow-gray-300 cursor-pointer"
      >
        <Grid size={18} />
        <span>All Category</span>
      </button>

      {/* Puente invisible para que el mouse no pierda el focus al bajar */}
      {isOpen && (
        <div className="absolute top-full right-0 pt-2 w-64 z-40">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl py-2 overflow-hidden">
            {categorias.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoriaId=${cat.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-mercatto-accent transition-colors"
              >
                <span>{cat.nombre}</span>
                <ChevronRight size={14} className="text-slate-400" />
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2">
              <Link
                to="/catalogo"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-xs font-bold text-mercatto-accent hover:underline"
              >
                Ver todo el catálogo →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryMenu
