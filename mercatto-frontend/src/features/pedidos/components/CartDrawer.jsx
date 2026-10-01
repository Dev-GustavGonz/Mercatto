import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/hooks/useCart'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'

export const CartDrawer = () => {
  const { items, drawerAbierto, setDrawerAbierto } = useCart()

  useEffect(() => {
    if (drawerAbierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [drawerAbierto])

  if (!drawerAbierto) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setDrawerAbierto(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tu Carrito ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setDrawerAbierto(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag size={32} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tu carrito está vacío</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                  Explora las novedades y agrega productos para iniciar tu compra.
                </p>
                <Link
                  to="/catalogo"
                  onClick={() => setDrawerAbierto(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow hover:bg-indigo-700 transition"
                >
                  <span>Explorar Productos</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, idx) => (
                  <CartItem key={`${item.producto.id}-${item.variante?.id || idx}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <CartSummary showCheckoutBtn={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDrawer
