import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import productoService from '../../services/productoService'

export const SearchBar = ({ className = '', placeholder = 'Buscar productos...' }) => {
  const [termino, setTermino] = useState('')
  const [sugerencias, setSugerencias] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
  const navigate = useNavigate()
  const wrapperRef = useRef(null)

  // Ocultar sugerencias si hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarSugerencias(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Efecto Debounce para buscar
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (termino.trim().length >= 2) {
        setCargando(true)
        try {
          const data = await productoService.listar({ q: termino.trim(), tamano: 5 })
          setSugerencias(data.content || [])
          setMostrarSugerencias(true)
        } catch (error) {
          setSugerencias([])
        } finally {
          setCargando(false)
        }
      } else {
        setSugerencias([])
        setMostrarSugerencias(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [termino])

  const handleSearch = (e) => {
    e.preventDefault()
    if (termino.trim()) {
      setMostrarSugerencias(false)
      navigate(`/catalogo?q=${encodeURIComponent(termino.trim())}`)
    }
  }

  const handleSeleccionarSugerencia = () => {
    setMostrarSugerencias(false)
    setTermino('')
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSearch} className="flex w-full">
        <input
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={() => termino.trim().length >= 2 && setMostrarSugerencias(true)}
          placeholder={placeholder}
          className="w-full pl-5 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-l-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-mercatto-accent/20 text-slate-800 placeholder-slate-400 transition-all"
        />
        <button 
          type="submit" 
          className="bg-mercatto-accent hover:bg-violet-600 text-white px-6 rounded-r-full flex items-center justify-center transition-colors shadow-sm hover:shadow-md hover:shadow-indigo-300"
        >
          {cargando ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </form>

      {/* Ventana flotante de sugerencias */}
      {mostrarSugerencias && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {sugerencias.length > 0 ? (
            <ul className="py-2">
              {sugerencias.map((prod) => (
                <li key={prod.id}>
                  <Link 
                    to={`/producto/${prod.id}`}
                    onClick={handleSeleccionarSugerencia}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <img 
                      src={prod.imagenes?.[0]?.url || 'https://via.placeholder.com/40'} 
                      alt={prod.titulo} 
                      className="w-10 h-10 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{prod.titulo}</p>
                      <p className="text-xs text-mercatto-accent font-bold">${prod.precio}</p>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-slate-100 mt-2">
                <button 
                  onClick={handleSearch}
                  className="w-full text-center py-3 text-xs font-bold text-slate-500 hover:text-mercatto-accent transition-colors"
                >
                  Ver todos los resultados para "{termino}"
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No encontramos productos que coincidan.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
