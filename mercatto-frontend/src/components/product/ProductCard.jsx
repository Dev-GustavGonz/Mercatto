import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { useFavorites } from '../../hooks/useFavorites'
import productoService from '../../services/productoService'
import StarRating from '../common/StarRating'
import { ShoppingCart, Heart, MessageSquare } from 'lucide-react'

export const ProductCard = ({ producto, onContactClick }) => {
  const { agregarItem } = useCart()
  const { autenticado } = useAuth()
  const { success, info } = useToast()
  const { favoriteIds, toggleFavoriteId } = useFavorites()
  const navigate = useNavigate()

  const esFavorito = favoriteIds.includes(producto.id)

  const imagenPrincipal =
    producto.imagenes?.find((img) => img.principal)?.url ||
    producto.imagenes?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'

  const handleToggleFavorito = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!autenticado) {
      info('Inicia sesión para guardar en favoritos')
      navigate('/login')
      return
    }
    try {
      const res = await productoService.toggleFavorito(producto.id)
      toggleFavoriteId(producto.id)
      success(res.mensaje)
    } catch {
      // Error manejado
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    agregarItem(producto, null, 1)
  }

  const handleContactarDirecto = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!autenticado) {
      info('Inicia sesión para consultar al vendedor')
      navigate('/login')
      return
    }
    const destinoId = producto.vendedor?.usuarioId || producto.vendedor?.id || 1
    navigate(`/mensajes?vendedorId=${destinoId}&productoId=${producto.id}`)
  }

  return (
    <div 
      onClick={() => navigate(`/producto/${producto.id}`)}
      className="group bg-mercatto-light rounded-3xl p-5 transition-all duration-300 flex flex-col relative h-[380px] hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* Favorite Button Top Right */}
      <button
        onClick={handleToggleFavorito}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-sm text-slate-400 hover:text-mercatto-accent hover:scale-110 transition-all cursor-pointer opacity-0 group-hover:opacity-100 sm:opacity-100"
        title="Guardar en favoritos"
      >
        <Heart size={16} className={esFavorito ? 'text-mercatto-accent fill-mercatto-accent' : ''} />
      </button>

      {/* Rating Badge Top Left */}
      <div className="absolute top-5 left-5 z-10 bg-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
        <StarRating rating={1} max={1} size={14} className="text-slate-800" />
        <span className="text-xs font-bold text-slate-800">
          {producto.calificacion != null ? producto.calificacion.toFixed(1) : '0.0'}
        </span>
      </div>

      {/* Image container */}
      <Link to={`/producto/${producto.id}`} className="relative h-48 w-full flex items-center justify-center mt-6">
        <img
          src={imagenPrincipal}
          alt={producto.titulo}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="mt-auto flex justify-between items-end">
        <div>
          <Link to={`/producto/${producto.id}`}>
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-mercatto-accent transition-colors" title={producto.titulo}>
              {producto.titulo}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-slate-800">${producto.precio}</span>
            {producto.precioOferta && (
              <span className="text-xs text-slate-400 line-through">${producto.precioOferta}</span>
            )}
            {!producto.precioOferta && (
              <span className="text-xs text-slate-400 line-through">${(producto.precio * 1.1).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons Bottom Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleContactarDirecto}
            className="bg-white hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-600 h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105 cursor-pointer"
            title="Preguntar al vendedor"
          >
            <MessageSquare size={17} />
          </button>

          <button
            onClick={handleAddToCart}
            className="bg-slate-900 group-hover:bg-mercatto-accent text-white h-10 w-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer"
            title="Añadir al Carrito"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
