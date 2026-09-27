import React, { useEffect, useState } from 'react'
import productoService from '../../services/productoService'
import StarRating from '../common/StarRating'
import ReviewForm from './ReviewForm'
import { useAuth } from '../../hooks/useAuth'
import { MessageSquare } from 'lucide-react'

export const ProductReviews = ({ productoId, calificacionPromedio = 0, totalResenas = 0 }) => {
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const { autenticado } = useAuth()

  const cargarResenas = () => {
    productoService.obtenerResenas(productoId).then((data) => {
      setResenas(data.content || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    cargarResenas()
  }, [productoId])

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Opiniones del Producto</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {Number(calificacionPromedio || 0).toFixed(1)}
            </span>
            <div>
              <StarRating rating={Number(calificacionPromedio || 0)} size={18} />
              <p className="text-xs text-slate-500">{totalResenas} valoraciones de clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {autenticado ? (
        <ReviewForm productoId={productoId} onReviewAdded={cargarResenas} />
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 text-center">
          Inicia sesión para escribir una opinión sobre este producto.
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {resenas.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Aún no hay opiniones para este producto.</p>
        ) : (
          resenas.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                    {r.usuario?.nombre?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.usuario?.nombre || 'Usuario'}</span>
                </div>
                <StarRating rating={r.calificacion} size={14} />
              </div>
              {r.titulo && <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.titulo}</h5>}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{r.comentario}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProductReviews
