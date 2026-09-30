import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import productoService from '../services/productoService'
import ProductGrid from '../components/product/ProductGrid'
import ProductFilters from '../components/product/ProductFilters'
import Pagination from '../components/common/Pagination'
import ModalContactoVendedor from '../components/product/ModalContactoVendedor'

export const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [productoContacto, setProductoContacto] = useState(null)

  const categoriaId = searchParams.get('categoriaId') || null
  const marca = searchParams.get('marca') || ''
  const termino = searchParams.get('q') || ''
  const orden = searchParams.get('orden') || 'recientes'
  const pagina = Number(searchParams.get('pagina') || 0)
  const precioMin = searchParams.get('precioMin') ? Number(searchParams.get('precioMin')) : null
  const precioMax = searchParams.get('precioMax') ? Number(searchParams.get('precioMax')) : null

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true)
      try {
        const data = await productoService.listar({
          categoriaId,
          marca: marca || null,
          q: termino,
          orden,
          pagina,
          precioMin,
          precioMax,
          tamano: 12,
        })
        setProductos(data.content || [])
        setTotalPages(data.totalPages || 0)
      } catch {
        setProductos([])
      } finally {
        setLoading(false)
      }
    }
    fetchProductos()
  }, [categoriaId, marca, termino, orden, pagina, precioMin, precioMax])

  const handleCategoryChange = (catId) => {
    const next = new URLSearchParams(searchParams)
    if (catId) {
      next.set('categoriaId', catId)
    } else {
      next.delete('categoriaId')
    }
    next.set('pagina', '0')
    setSearchParams(next)
  }

  const handleMarcaChange = (nuevaMarca) => {
    const next = new URLSearchParams(searchParams)
    if (nuevaMarca) {
      next.set('marca', nuevaMarca)
    } else {
      next.delete('marca')
    }
    next.set('pagina', '0')
    setSearchParams(next)
  }

  const handlePriceChange = ({ min, max }) => {
    const next = new URLSearchParams(searchParams)
    if (min) next.set('precioMin', min)
    else next.delete('precioMin')
    if (max) next.set('precioMax', max)
    else next.delete('precioMax')
    next.set('pagina', '0')
    setSearchParams(next)
  }

  const handleOrdenChange = (newOrden) => {
    const next = new URLSearchParams(searchParams)
    next.set('orden', newOrden)
    next.set('pagina', '0')
    setSearchParams(next)
  }

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams)
    next.set('pagina', newPage.toString())
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    setSearchParams({})
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {termino ? `Resultados para: "${termino}"` : 'Catálogo de Productos'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Explora productos publicados por tiendas y proveedores verificados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            selectedCategory={categoriaId}
            onCategoryChange={handleCategoryChange}
            selectedMarca={marca}
            onMarcaChange={handleMarcaChange}
            priceRange={{ min: precioMin, max: precioMax }}
            onPriceChange={handlePriceChange}
            orden={orden}
            onOrdenChange={handleOrdenChange}
            onReset={handleReset}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <ProductGrid
            productos={productos}
            loading={loading}
            onContactClick={(prod) => setProductoContacto(prod)}
          />

          <Pagination
            currentPage={pagina}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {productoContacto && (
        <ModalContactoVendedor
          isOpen={true}
          producto={productoContacto}
          onClose={() => setProductoContacto(null)}
        />
      )}
    </div>
  )
}

export default Catalogo
