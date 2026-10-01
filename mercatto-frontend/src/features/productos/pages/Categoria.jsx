import React from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Catalogo from './Catalogo'

export const Categoria = () => {
  const { id } = useParams()
  if (id) {
    return <Navigate to={`/catalogo?categoriaId=${id}`} replace />
  }
  return <Catalogo />
}

export default Categoria
