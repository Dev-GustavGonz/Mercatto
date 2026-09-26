import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import productoService from '../services/productoService'
import ProductCard from '../components/product/ProductCard'
import ModalContactoVendedor from '../components/product/ModalContactoVendedor'
import Button from '../components/common/Button'
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react'

export const Home = () => {
  const [destacados, setDestacados] = useState([])
  const [nuevos, setNuevos] = useState([])
  const [loading, setLoading] = useState(true)
  const [productoContacto, setProductoContacto] = useState(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dest, nuev] = await Promise.all([
          productoService.obtenerDestacados(),
          productoService.obtenerNuevos(),
        ])
        setDestacados(dest || [])
        setNuevos(nuev || [])
      } catch {
        // Fallback datos vacíos
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const bigBannerProduct = destacados[0]
  const smallBannerProduct = destacados[1]
  const hotDealsProducts = destacados.slice(2, 5) // 3 products

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Hero Banners Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Banner (Left) */}
        {bigBannerProduct && (
          <div className="lg:col-span-2 relative bg-mercatto-dark rounded-3xl p-10 flex flex-col justify-center overflow-hidden min-h-[400px]">
            <div className="relative z-10 w-1/2 space-y-4">
              <p className="text-white font-medium text-lg">
                Start at <span className="text-mercatto-accent font-bold">${bigBannerProduct.precio}</span> Only
              </p>
              <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight">
                {bigBannerProduct.titulo}
              </h2>
              <p className="text-gray-400 text-sm line-clamp-2 max-w-sm">
                {bigBannerProduct.descripcion || "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
              </p>
              <div className="pt-4">
                <Link to={`/producto/${bigBannerProduct.id}`}>
                  <button className="bg-mercatto-primary text-white hover:bg-blue-700 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all hover:shadow-lg hover:shadow-gray-500/50">
                    SHOP NOW <ShoppingCart size={18} />
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Navigation arrows at bottom left */}
            <div className="absolute bottom-8 left-10 flex items-center gap-4 z-10 text-white">
              <button className="hover:text-mercatto-accent transition-colors"><ArrowLeft size={18}/></button>
              <span className="text-sm font-semibold">01/04</span>
              <button className="text-mercatto-accent hover:text-red-500 transition-colors"><ArrowRight size={18}/></button>
            </div>

            {/* Image Right Side */}
            <div className="absolute top-0 right-0 w-1/2 h-full p-8 flex items-center justify-center">
              <img 
                src={bigBannerProduct.imagenes?.[0]?.url || 'https://via.placeholder.com/400'} 
                alt={bigBannerProduct.titulo}
                className="max-h-full object-contain filter drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}

        {/* Small Banner (Right) */}
        {smallBannerProduct && (
          <div className="relative bg-mercatto-dark rounded-3xl p-8 flex flex-col overflow-hidden min-h-[400px]">
            <div className="relative z-10 space-y-3">
              <h3 className="text-white text-2xl font-bold leading-tight max-w-[200px]">
                {smallBannerProduct.titulo}
              </h3>
              <p className="text-mercatto-accent font-bold text-lg">
                ${smallBannerProduct.precio} USD
              </p>
              <div className="pt-2">
                <Link to={`/producto/${smallBannerProduct.id}`}>
                  <button className="bg-white text-slate-900 hover:bg-gray-100 px-5 py-2 rounded-full flex items-center gap-2 font-semibold text-sm transition-all hover:shadow-lg hover:shadow-gray-500/30">
                    SHOP NOW <ShoppingCart size={16} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Image Bottom/Center */}
            <div className="absolute bottom-6 left-0 right-0 px-10 flex justify-center h-48">
               <img 
                src={smallBannerProduct.imagenes?.[0]?.url || 'https://via.placeholder.com/300'} 
                alt={smallBannerProduct.titulo}
                className="h-full object-contain filter drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hot Deals Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        
        {/* Hot Deals Red Card */}
        <div className="bg-mercatto-accent rounded-3xl p-8 text-white flex flex-col items-center justify-between shadow-sm">
          <h3 className="text-2xl font-bold text-center">Hot Deals Product</h3>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-[240px] my-6">
            <div className="bg-white text-mercatto-accent rounded-xl p-3 flex flex-col items-center justify-center font-bold relative">
              <span className="text-2xl">01</span>
              <span className="text-[10px] text-gray-500 uppercase">Days</span>
              {/* Colon divider mock */}
              <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-white text-xl font-bold">:</span>
            </div>
            <div className="bg-white text-mercatto-accent rounded-xl p-3 flex flex-col items-center justify-center font-bold">
              <span className="text-2xl">23</span>
              <span className="text-[10px] text-gray-500 uppercase">Hours</span>
            </div>
            <div className="bg-white text-mercatto-accent rounded-xl p-3 flex flex-col items-center justify-center font-bold relative">
              <span className="text-2xl">34</span>
              <span className="text-[10px] text-gray-500 uppercase">Mins</span>
              {/* Colon divider mock */}
              <span className="absolute -right-3 top-1/2 -translate-y-1/2 text-white text-xl font-bold">:</span>
            </div>
            <div className="bg-white text-mercatto-accent rounded-xl p-3 flex flex-col items-center justify-center font-bold">
              <span className="text-2xl">57</span>
              <span className="text-[10px] text-gray-500 uppercase">Secs</span>
            </div>
          </div>

          <button className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-2.5 rounded-full font-bold text-sm w-full transition-all hover:shadow-lg hover:shadow-red-800/50">
            VIEW ALL
          </button>
        </div>

        {/* Product Cards */}
        {hotDealsProducts.map(prod => (
          <ProductCard key={prod.id} producto={prod} onContactClick={setProductoContacto} />
        ))}
      </div>

      {/* Modal Contacto Vendedor */}
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

export default Home
