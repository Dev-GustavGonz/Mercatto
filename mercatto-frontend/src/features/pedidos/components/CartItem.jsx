import React from 'react'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/utils/formatCurrency'
import { Trash2, Plus, Minus } from 'lucide-react'

export const CartItem = ({ item }) => {
  const { actualizarCantidad, eliminarItem } = useCart()
  const { producto, variante, cantidad } = item

  const precio = variante
    ? variante.precioOferta || variante.precio
    : producto.precioOferta || producto.precio

  const imagen =
    variante?.imagenUrl ||
    producto.imagenes?.find((i) => i.principal)?.url ||
    producto.imagenes?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'

  return (
    <div className="flex gap-3.5 py-4 border-b border-slate-100 dark:border-slate-800 last:border-none">
      {/* Image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
        <img src={imagen} alt={producto.titulo} className="w-full h-full object-cover" />
      </div>

      {/* Info & Actions */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
              {producto.titulo}
            </h4>
            {variante && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {variante.nombre}
              </span>
            )}
          </div>
          <button
            onClick={() => eliminarItem(producto.id, variante?.id)}
            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => actualizarCantidad(producto.id, variante?.id, cantidad - 1)}
              className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Minus size={12} />
            </button>
            <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              {cantidad}
            </span>
            <button
              onClick={() => actualizarCantidad(producto.id, variante?.id, cantidad + 1)}
              className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {formatCurrency(precio * cantidad)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartItem
