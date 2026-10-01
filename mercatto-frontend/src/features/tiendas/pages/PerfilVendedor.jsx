import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { productoService, ProductGrid } from '@/features/productos'
import Spinner from '@/components/common/Spinner'
import { Store, MapPin, Star } from 'lucide-react'

export const PerfilVendedor = () => {
  const { id } = useParams()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    productoService
      .listar({ vendedorId: id, pagina: 0, tamano: 20 })
      .then((data) => setProductos(data.content || []))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner size="lg" className="py-24" />

  const vendedor = productos[0]?.vendedor

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
          <Store size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {vendedor?.nombreTienda || 'Tienda Proveedor'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {vendedor?.ciudad || 'Colombia'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={14} className="fill-amber-400" /> {(vendedor?.calificacion || 5.0).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Catálogo de la Tienda ({productos.length} productos)
        </h2>
        <ProductGrid productos={productos} />
      </div>
    </div>
  )
}

export default PerfilVendedor
