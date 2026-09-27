import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import productoService from '../services/productoService'
import ProductCard from '../components/product/ProductCard'
import ModalContactoVendedor from '../components/product/ModalContactoVendedor'
import Button from '../components/common/Button'
import { ArrowLeft, ArrowRight, ShoppingCart, Laptop, Shirt, Home as HomeIcon, Activity, Sparkles, Wrench, Smartphone, Footprints, Utensils, Tags } from 'lucide-react'

// Helper para mapear el string del backend a un componente de Lucide
const renderIcon = (iconName) => {
  const IconMap = {
    Laptop, Shirt, Home: HomeIcon, Activity, Sparkles, Wrench, Smartphone, Footprints, Utensils
  }
  const IconoComponente = IconMap[iconName] || Tags
  return <IconoComponente size={32} strokeWidth={1.5} className="mb-3 text-slate-700 group-hover:scale-110 group-hover:text-mercatto-accent transition-all" />
}

export const Home = () => {
  const [destacados, setDestacados] = useState([])
  const [nuevos, setNuevos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [productoContacto, setProductoContacto] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [nuevosIndex, setNuevosIndex] = useState(0)

  // ... (useEffects)

  const handlePrevNuevos = () => {
    setNuevosIndex(prev => Math.max(0, prev - 1))
  }

  const handleNextNuevos = () => {
    // Si queremos mover de a 1, el límite es length - 4 (para no mostrar espacios vacíos)
    // Si hay menos de 4 productos, el límite es 0.
    const maxIndex = Math.max(0, nuevos.length - 4)
    setNuevosIndex(prev => Math.min(maxIndex, prev + 1))
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [dest, nuev, cats] = await Promise.all([
          productoService.obtenerDestacados(),
          productoService.obtenerNuevos(),
          productoService.listarCategorias()
        ])
        setDestacados(dest || [])
        setNuevos(nuev || [])
        setCategorias(cats || [])
      } catch {
        // Fallback datos vacíos
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  // Auto-play del carrusel cada 5 segundos
  useEffect(() => {
    if (destacados.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === destacados.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [destacados])

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? destacados.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === destacados.length - 1 ? 0 : prev + 1))
  }

  const bigBannerProduct = destacados[currentSlide] || destacados[0]
  const smallBannerProduct = destacados[1] || destacados[0]
  const hotDealsProducts = destacados.slice(2, 6)

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Hero Banners Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Banner (Left) */}
        {bigBannerProduct && (
          <div className="lg:col-span-2 relative bg-mercatto-dark rounded-3xl p-10 flex flex-col justify-center overflow-hidden min-h-[400px]">
            <div className="relative z-10 w-1/2 space-y-4">
              <p className="text-white font-medium text-lg">
                Start at <span className="text-mercatto-accent font-bold">${bigBannerProduct.precio}</span> Only
              </p>
              <h2 className="text-white text-4xl sm:text-5xl font-bold leading-tight transition-all duration-300">
                {bigBannerProduct.titulo}
              </h2>
              <p className="text-gray-400 text-sm line-clamp-2 max-w-sm">
                {bigBannerProduct.descripcion || "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
              </p>
              <div className="pt-4">
                <Link to={`/producto/${bigBannerProduct.id}`}>
                  <button className="bg-mercatto-accent text-white hover:bg-violet-600 px-6 py-2.5 rounded-full flex items-center gap-2 font-semibold transition-all hover:shadow-lg hover:shadow-gray-500/50">
                    SHOP NOW <ShoppingCart size={18} />
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Navigation arrows at bottom left */}
            <div className="absolute bottom-8 left-10 flex items-center gap-4 z-10 text-white">
              <button onClick={handlePrevSlide} className="hover:text-mercatto-accent transition-colors cursor-pointer"><ArrowLeft size={18}/></button>
              <span className="text-sm font-semibold">
                {String(currentSlide + 1).padStart(2, '0')}/{String(destacados.length || 1).padStart(2, '0')}
              </span>
              <button onClick={handleNextSlide} className="text-mercatto-accent hover:text-white transition-colors cursor-pointer"><ArrowRight size={18}/></button>
            </div>

            {/* Image Right Side */}
            <div className="absolute top-0 right-0 w-1/2 h-full p-8 flex items-center justify-center">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-500">
                <img 
                  src={bigBannerProduct.imagenes?.[0]?.url || 'https://via.placeholder.com/400'} 
                  alt={bigBannerProduct.titulo}
                  className="w-full h-full object-cover filter transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mercatto-dark/40 to-transparent pointer-events-none"></div>
              </div>
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
            <div className="absolute bottom-6 left-6 right-6 h-48 flex justify-center">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={smallBannerProduct.imagenes?.[0]?.url || 'https://via.placeholder.com/300'} 
                  alt={smallBannerProduct.titulo}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mercatto-dark/50 to-transparent pointer-events-none"></div>
              </div>
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

      {/* Quick Actions Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
        {[
          { icon: <ShoppingCart size={20} />, title: "Envío Gratis", subtitle: "En millones de productos" },
          { icon: <ShoppingCart size={20} />, title: "Ingresa a tu cuenta", subtitle: "Disfruta de ofertas" },
          { icon: <ShoppingCart size={20} />, title: "Ingresa tu ubicación", subtitle: "Calcula costos" },
          { icon: <ShoppingCart size={20} />, title: "Medios de pago", subtitle: "Paga de forma segura" },
          { icon: <ShoppingCart size={20} />, title: "Menos de $40.000", subtitle: "Descubre productos" },
          { icon: <ShoppingCart size={20} />, title: "Compra protegida", subtitle: "Te devolvemos el dinero" },
        ].map((action, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition cursor-pointer border border-slate-100 group">
            <div className="w-12 h-12 bg-indigo-50 text-mercatto-accent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <h4 className="font-bold text-sm text-slate-800">{action.title}</h4>
            <p className="text-[10px] text-slate-500 mt-1">{action.subtitle}</p>
          </div>
        ))}
      </div>

      {/* New Arrivals Section */}
      <div className="pt-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800">Recién Llegados</h2>
            <Link to="/catalogo" className="text-sm font-semibold text-mercatto-accent hover:underline hidden sm:block">
              Ver todos los productos
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevNuevos}
              disabled={nuevosIndex === 0}
              className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${
                nuevosIndex === 0 
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                  : 'bg-white text-slate-500 hover:text-mercatto-accent hover:shadow-md cursor-pointer'
              }`}
            >
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={handleNextNuevos}
              disabled={nuevosIndex >= nuevos.length - 4 || nuevos.length <= 4}
              className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all ${
                nuevosIndex >= nuevos.length - 4 || nuevos.length <= 4
                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                  : 'bg-white text-slate-500 hover:text-mercatto-accent hover:shadow-md cursor-pointer'
              }`}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Simulando un slider horizontal con Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-all duration-500">
          {nuevos.slice(nuevosIndex, nuevosIndex + 4).map(prod => (
            <ProductCard key={prod.id} producto={prod} onContactClick={setProductoContacto} />
          ))}
          {nuevos.length === 0 && (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500 font-medium">Aún no hay más productos por mostrar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Categories Banner Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 pb-10">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10 w-2/3 space-y-3">
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">Smartphones</span>
            <h3 className="text-2xl font-bold text-white leading-tight">Hasta 40% Off en Smartphones</h3>
            <Link to="/catalogo">
              <button className="text-white text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all pt-2 cursor-pointer">
                Comprar Ahora <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative group border border-indigo-200">
          <div className="relative z-10 w-2/3 space-y-3">
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Computadores</span>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">Descubre las nuevas Laptops</h3>
            <Link to="/catalogo">
              <button className="text-indigo-600 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all pt-2 cursor-pointer">
                Explorar <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Grid (Estilo ML) */}
      {categorias && categorias.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Categorías Populares</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categorias.slice(0, 12).map((cat) => (
              <Link key={cat.id} to={`/catalogo?categoriaId=${cat.id}`} className="flex flex-col items-center justify-center p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition group">
                {renderIcon(cat.icono)}
                <span className="text-xs font-semibold text-slate-600 text-center">{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
