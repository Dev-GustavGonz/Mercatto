import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '@/utils/storage'
import { pedidoService } from '../features/pedidos'
import { useToast } from './ToastContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => storage.get('mercatto_cart', []))
  const [cupon, setCupon] = useState(() => storage.get('mercatto_coupon', null))
  const [drawerAbierto, setDrawerAbierto] = useState(false)
  const { success, error: toastError } = useToast()

  useEffect(() => {
    storage.set('mercatto_cart', items)
  }, [items])

  useEffect(() => {
    storage.set('mercatto_coupon', cupon)
  }, [cupon])

  const agregarItem = (producto, variante = null, cantidad = 1) => {
    setItems((prev) => {
      const index = prev.findIndex(
        (i) => i.producto.id === producto.id && (i.variante?.id || null) === (variante?.id || null)
      )

      if (index > -1) {
        const nuevos = [...prev]
        nuevos[index].cantidad += cantidad
        return nuevos
      } else {
        return [...prev, { producto, variante, cantidad }]
      }
    })
    success(`"${producto.titulo}" agregado al carrito`)
  }

  const eliminarItem = (productoId, varianteId = null) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.producto.id === productoId && (i.variante?.id || null) === (varianteId || null))
      )
    )
  }

  const actualizarCantidad = (productoId, varianteId = null, cantidad) => {
    if (cantidad <= 0) {
      eliminarItem(productoId, varianteId)
      return
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.producto.id === productoId && (i.variante?.id || null) === (varianteId || null)) {
          return { ...i, cantidad }
        }
        return i
      })
    )
  }

  const limpiarCarrito = () => {
    setItems([])
    setCupon(null)
    storage.remove('mercatto_cart')
    storage.remove('mercatto_coupon')
  }

  const subtotal = items.reduce((acc, item) => {
    const precio = item.variante
      ? item.variante.precioOferta || item.variante.precio
      : item.producto.precioOferta || item.producto.precio
    return acc + precio * item.cantidad
  }, 0)

  const descuento = cupon ? (cupon.descuento || 0) : 0
  const costoEnvio = subtotal >= 150000 || subtotal === 0 ? 0 : 12000
  const total = Math.max(0, subtotal - descuento + costoEnvio)
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0)

  const aplicarCupon = async (codigo) => {
    try {
      const res = await pedidoService.validarCupon(codigo, subtotal)
      if (res?.exito) {
        setCupon(res)
        success(`Cupón '${codigo}' aplicado: -$${res.descuento}`)
        return { exito: true }
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Cupón inválido o expirado'
      toastError(msg)
      return { exito: false, mensaje: msg }
    }
  }

  const removerCupon = () => {
    setCupon(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        descuento,
        costoEnvio,
        total,
        cupon,
        drawerAbierto,
        setDrawerAbierto,
        agregarItem,
        eliminarItem,
        actualizarCantidad,
        limpiarCarrito,
        aplicarCupon,
        removerCupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}
