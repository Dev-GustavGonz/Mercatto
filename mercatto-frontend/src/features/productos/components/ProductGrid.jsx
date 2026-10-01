import React from 'react'
import ProductCard from './ProductCard'
import EmptyState from '@/components/common/EmptyState'
import Spinner from '@/components/common/Spinner'

export const ProductGrid = ({
  productos = [],
  loading = false,
  onContactClick,
  emptyTitle = 'No encontramos productos',
  emptyDescription = 'Intenta buscar con otros términos o cambia los filtros seleccionados.',
}) => {
  if (loading) {
    return <Spinner size="lg" className="py-20" />
  }

  if (!productos || productos.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {productos.map((prod) => (
        <ProductCard key={prod.id} producto={prod} onContactClick={onContactClick} />
      ))}
    </div>
  )
}

export default ProductGrid
