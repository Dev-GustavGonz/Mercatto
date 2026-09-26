import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Users, TrendingUp, Heart } from 'lucide-react'

export const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16 font-sans">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800">Sobre Mercatto</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Construyendo el puente directo entre fabricantes, proveedores y compradores para un comercio más justo y transparente.
        </p>
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Nuestra Misión</h2>
          <p className="text-slate-600 leading-relaxed">
            Nacimos con una idea simple: eliminar a los intermediarios innecesarios. En Mercatto, le damos el poder a las empresas y emprendedores de vender directamente a sus clientes finales con total seguridad y autonomía.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Ya seas un comprador buscando las mejores ofertas o un vendedor queriendo expandir tu negocio, nuestra plataforma te ofrece las herramientas necesarias para triunfar.
          </p>
          <Link to="/registro?rol=VENDEDOR" className="inline-block bg-mercatto-accent hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-shadow hover:shadow-lg hover:shadow-gray-300">
            Únete como Vendedor
          </Link>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
            alt="Equipo Mercatto" 
            className="rounded-2xl shadow-md object-cover aspect-video md:aspect-square w-full"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-black text-slate-800 text-center">Nuestros Pilares</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-mercatto-light p-6 rounded-2xl flex gap-4">
            <div className="bg-white p-3 rounded-full h-fit text-mercatto-accent shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Pagos 100% Seguros</h3>
              <p className="text-slate-600 text-sm">Tu dinero está protegido en cada transacción. Integramos pasarelas de pago de clase mundial.</p>
            </div>
          </div>
          <div className="bg-mercatto-light p-6 rounded-2xl flex gap-4">
            <div className="bg-white p-3 rounded-full h-fit text-mercatto-accent shadow-sm">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Comunidad Directa</h3>
              <p className="text-slate-600 text-sm">Habla con los proveedores, negocia volúmenes y construye relaciones comerciales a largo plazo.</p>
            </div>
          </div>
          <div className="bg-mercatto-light p-6 rounded-2xl flex gap-4">
            <div className="bg-white p-3 rounded-full h-fit text-mercatto-accent shadow-sm">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Crecimiento</h3>
              <p className="text-slate-600 text-sm">Proporcionamos herramientas avanzadas y paneles de control para que escales tus ventas rápidamente.</p>
            </div>
          </div>
          <div className="bg-mercatto-light p-6 rounded-2xl flex gap-4">
            <div className="bg-white p-3 rounded-full h-fit text-mercatto-accent shadow-sm">
              <Heart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Hecho con Pasión</h3>
              <p className="text-slate-600 text-sm">Nuestro equipo trabaja todos los días para ofrecerte la mejor experiencia de compra y venta.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
