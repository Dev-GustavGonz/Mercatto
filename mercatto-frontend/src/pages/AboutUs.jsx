import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Users, TrendingUp, Heart } from 'lucide-react'

export const AboutUs = () => {
  const [activeTab, setActiveTab] = useState('Misión')

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16 font-sans">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800">Sobre Mercatto</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Construyendo el puente directo entre fabricantes, proveedores y compradores para un comercio más justo y transparente.
        </p>
      </div>

      {/* Interactive Story Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row border-b border-slate-100">
          {['Misión', 'Visión', 'Nuestra Historia'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-mercatto-accent text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center transition-all duration-500">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-black text-slate-800">
              {activeTab === 'Misión' && 'Nuestra Misión'}
              {activeTab === 'Visión' && 'Hacia Dónde Vamos'}
              {activeTab === 'Nuestra Historia' && 'Cómo Empezamos'}
            </h2>
            
            {activeTab === 'Misión' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-slate-600 leading-relaxed">
                  Nacimos con una idea simple: eliminar a los intermediarios innecesarios. En Mercatto, le damos el poder a las empresas y emprendedores de vender directamente a sus clientes finales con total seguridad y autonomía.
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Creemos que un comercio más directo es un comercio más justo para todos.
                </p>
              </div>
            )}

            {activeTab === 'Visión' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-slate-600 leading-relaxed">
                  Para el 2030, queremos ser la plataforma tecnológica número uno de Latinoamérica en empoderamiento de pequeñas y medianas empresas.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Imaginamos un mundo donde cualquier persona, desde su casa, pueda acceder a proveedores globales con un solo clic, sin barreras tecnológicas ni financieras.
                </p>
              </div>
            )}

            {activeTab === 'Nuestra Historia' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-slate-600 leading-relaxed">
                  Todo comenzó en un pequeño garaje en 2026. Éramos un grupo de desarrolladores frustrados por las altas comisiones que cobraban otras plataformas.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Decidimos armar nuestra propia solución. Lo que empezó como un pequeño proyecto de fin de semana, hoy es un ecosistema vibrante que conecta a miles de personas diariamente.
                </p>
              </div>
            )}

            <div className="pt-4">
              <Link to="/registro?rol=VENDEDOR" className="inline-block bg-mercatto-accent hover:bg-violet-600 text-white font-bold py-3 px-8 rounded-full transition-shadow hover:shadow-lg hover:shadow-indigo-500/30">
                Únete a la Revolución
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-lg bg-slate-100">
            <img 
              src={
                activeTab === 'Misión' ? "/images/about-mision.jpg" :
                activeTab === 'Visión' ? "/images/about-vision.jpg" :
                "/images/about-historia.jpg"
              }
              alt={activeTab} 
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
          </div>
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
