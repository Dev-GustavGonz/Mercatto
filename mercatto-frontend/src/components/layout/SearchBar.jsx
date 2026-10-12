import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { productoService } from '@/features/productos'

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
      <form 
        onSubmit={handleSearch} 
        className="flex items-center w-full bg-slate-100/85 hover:bg-slate-100 focus-within:bg-white border border-slate-200/75 focus-within:border-emerald-600/40 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-full p-1 transition-all duration-200"
      >
        <input
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          onFocus={() => termino.trim().length >= 2 && setMostrarSugerencias(true)}
          placeholder={placeholder}
          className="w-full pl-4 pr-2 py-1.5 bg-transparent text-xs sm:text-sm focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
        />
        <button 
          type="submit" 
          className="w-8 h-8 rounded-full bg-[#051f18] hover:bg-emerald-600 text-emerald-300 hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer shadow-xs"
          title="Buscar"
        >
          {cargando ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </button>
      </form>

      {/* Ventana flotante de sugerencias */}
      {mostrarSugerencias && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] z-50 overflow-hidden">
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
