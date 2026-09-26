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
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-mercatto-accent text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:shadow-gray-300 cursor-pointer"
      >
        <Grid size={18} />
        <span>All Category</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-40">
          {categorias.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoriaId=${cat.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition"
            >
              <span>{cat.nombre}</span>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
            <Link
              to="/catalogo"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Ver todo el catálogo →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryMenu
