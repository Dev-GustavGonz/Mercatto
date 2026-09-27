import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import productoService from '../services/productoService'

const FavoritesContext = createContext(null)

export const FavoritesProvider = ({ children }) => {
  const { autenticado } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar favoritos al autenticarse
  useEffect(() => {
    if (autenticado) {
      cargarFavoritos()
    } else {
      setFavoriteIds([])
    }
  }, [autenticado])

  const cargarFavoritos = async () => {
    try {
      setLoading(true)
      // fetch all favorites. We can use a large size to get them all
      const data = await productoService.listarFavoritos({ size: 1000 })
      const ids = (data.content || []).map((f) => f.producto.id)
      setFavoriteIds(ids)
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavoriteId = (id) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fid) => fid !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavoriteId, loadingFavoritos: loading }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider')
  }
  return context
}
