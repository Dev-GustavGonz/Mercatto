import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import CartItem from '@/features/pedidos/components/CartItem'
import CartSummary from '@/features/pedidos/components/CartSummary'
import Button from '@/components/common/Button'
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'

export const Carrito = () => {
  const { items, limpiarCarrito } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tu carrito de compras está vacío</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Encuentra productos increíbles de nuestros proveedores y agrégalos para comprar.
        </p>
        <Link to="/catalogo">
          <Button variant="primary" size="md" className="mt-4">
            Explorar el Catálogo
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Carrito de Compras</h1>
          <p className="text-xs text-slate-500 mt-0.5">{items.length} productos agregados</p>
        </div>
        <button
          onClick={limpiarCarrito}
          className="text-xs text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={13} />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item, idx) => (
            <CartItem key={`${item.producto.id}-${item.variante?.id || idx}`} item={item} />
          ))}
          <div className="pt-4">
            <Link to="/catalogo" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
              <ArrowLeft size={14} />
              <span>Continuar comprando</span>
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-4">
          <CartSummary showCheckoutBtn={true} onCheckout={() => navigate('/checkout')} />
        </div>
      </div>
    </div>
  )
}

export default Carrito
