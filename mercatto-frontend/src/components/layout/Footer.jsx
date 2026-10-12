import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck, Truck, RefreshCw, Headphones, Settings } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import MercattoLogo from '@/components/common/MercattoLogo'

export const Footer = () => {
  const { idioma, t } = useLanguage()
  const location = useLocation()

  // Ocultar footer en las rutas de paneles de administración y vendedor
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/panel-vendedor') ||
    location.pathname.startsWith('/vendedor')
  ) {
    return null
  }

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
                <h4 className="text-sm font-bold text-white">{t('envios_colombia')}</h4>
                <p className="text-xs text-slate-400">{idioma === 'EN' ? 'Free from $150.000 COP' : 'Gratis desde $150.000'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('compra_segura')}</h4>
                <p className="text-xs text-slate-400">{idioma === 'EN' ? 'Encrypted & protected checkout' : 'Pasarela cifrada y protegida'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{idioma === 'EN' ? 'Warranty & Returns' : 'Garantía y Devolución'}</h4>
                <p className="text-xs text-slate-400">{idioma === 'EN' ? 'Direct store resolution' : 'Soporte directo con vendedores'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors">
              <div className="bg-red-500/10 text-mercatto-accent p-3 rounded-full shrink-0">
                <Headphones size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('atencion_cliente')}</h4>
                <p className="text-xs text-slate-400">{idioma === 'EN' ? 'Official WhatsApp & tickets' : 'Habla directo con soporte'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4" title="Inicio de Mercatto">
              <MercattoLogo className="text-3xl text-violet-400" />
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
              <li><Link to="/rastreo" className="text-violet-400 font-semibold hover:text-white transition-colors">Rastrear mi Pedido</Link></li>
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
            <Link to="/privacidad" className="hover:text-violet-400 transition-colors">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-violet-400 transition-colors">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
