import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RefreshCw, Headphones, Settings } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-mercatto-dark text-slate-300 mt-12 font-sans">
      {/* Features bar */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Envíos a todo el país</h4>
                <p className="text-xs text-slate-400">Gratis desde $150.000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Compra 100% Segura</h4>
                <p className="text-xs text-slate-400">Pasarela cifrada y protegida</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Garantía y Devolución</h4>
                <p className="text-xs text-slate-400">Soporte directo con vendedores</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Soporte y Negociación</h4>
                <p className="text-xs text-slate-400">Habla directo con el proveedor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Settings className="text-mercatto-accent w-8 h-8" />
              <div>
                <span className="text-2xl font-black tracking-tight text-white leading-none block">
                  Mercatto
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  A Marketplace Theme
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              La plataforma que une compradores y proveedores directamente. Compra con seguridad y comunícate sin intermediarios.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Comprar</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/catalogo" className="text-slate-400 hover:text-mercatto-accent transition-colors">Explorar Catálogo</Link></li>
              <li><Link to="/catalogo?orden=ofertas" className="text-slate-400 hover:text-mercatto-accent transition-colors">Ofertas Especiales</Link></li>
              <li><Link to="/favoritos" className="text-slate-400 hover:text-mercatto-accent transition-colors">Lista de Deseos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Vendedores</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/registro?rol=VENDEDOR" className="text-slate-400 hover:text-mercatto-accent transition-colors">Crear Tienda Virtual</Link></li>
              <li><Link to="/vendedor" className="text-slate-400 hover:text-mercatto-accent transition-colors">Panel de Vendedor</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-mercatto-accent transition-colors">Acceso Proveedores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Soporte</h4>
            <ul className="space-y-3 text-sm">
              <li><span className="text-slate-400">soporte@mercatto.com</span></li>
              <li><span className="text-slate-400">+57 (300) 123-4567</span></li>
              <li><span className="text-slate-400">Lunes a Sábado: 8am - 6pm</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Mercatto Marketplace. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-mercatto-accent cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-mercatto-accent cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
