import React, { useState } from 'react'
import StarRating from '@/components/common/StarRating'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useToast } from '@/hooks/useToast'
import { productoService } from '@/features/productos'

export const ReviewForm = ({ productoId, onReviewAdded }) => {
  const [calificacion, setCalificacion] = useState(5)
  const [titulo, setTitulo] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comentario.trim()) {
      error('Por favor escribe un comentario sobre tu experiencia.')
      return
    }

    setLoading(true)
    try {
      await productoService.crearResena({
        productoId,
        calificacion,
        titulo: titulo.trim() || 'Opinión de comprador',
        comentario: comentario.trim(),
      })
      success('¡Gracias por tu calificación!')
      setTitulo('')
      setComentario('')
      if (onReviewAdded) onReviewAdded()
    } catch (err) {
      error(err.response?.data?.mensaje || 'No se pudo enviar la calificación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Deja tu opinión sobre este producto</h4>
      
      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Calificación:
        </label>
        <StarRating
          rating={calificacion}
          size={22}
          interactive={true}
          onChange={(val) => setCalificacion(val)}
        />
      </div>

      <Input
        label="Título (opcional)"
        placeholder="Ej: Excelente calidad, entrega rápida"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Comentario
        </label>
        <textarea
          rows={3}
          placeholder="¿Qué te pareció el producto? ¿Cumplió tus expectativas?"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <Button type="submit" loading={loading} variant="primary" size="sm">
        Publicar Reseña
      </Button>
    </form>
  )
}

export default ReviewForm
