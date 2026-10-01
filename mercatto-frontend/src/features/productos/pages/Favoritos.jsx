import React, { useEffect, useState } from 'react'
import { productoService } from '@/features/productos'
import ProductGrid from '../components/ProductGrid'
import EmptyState from '@/components/common/EmptyState'
import { Heart } from 'lucide-react'

export const Favoritos = () => {
  const [favoritos, setFavoritos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productoService
      .listarFavoritos()
      .then((data) => {
        const prods = (data.content || []).map((f) => f.producto).filter(Boolean)
        setFavoritos(prods)
      })
      .catch(() => setFavoritos([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2">
        <Heart size={24} className="text-rose-500 fill-rose-500" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Mis Favoritos</h1>
      </div>

      {favoritos.length === 0 && !loading ? (
        <EmptyState
          icon={Heart}
          title="Tu lista de favoritos está vacía"
          description="Guarda los productos que más te gustan haciendo clic en el corazón para verlos después."
          actionLabel="Explorar Catálogo"
          onAction={() => (window.location.href = '/catalogo')}
        />
      ) : (
        <ProductGrid productos={favoritos} loading={loading} />
      )}
    </div>
  )
}

export default Favoritos
