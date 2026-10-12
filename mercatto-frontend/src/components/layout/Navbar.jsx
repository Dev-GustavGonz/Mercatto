import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useFavorites } from '@/hooks/useFavorites'
import { useLanguage } from '@/hooks/useLanguage'
import { productoService } from '../../features/productos'
import { tiendaService } from '../../features/tiendas'
import SearchBar from './SearchBar'
import MercattoLogo from '../common/MercattoLogo'
import { 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  Store, 
  Shield, 
  Package, 
  Menu, 
  X, 
  MessageSquare, 
  Globe, 
  ChevronDown,
  Sparkles,
  Tag,
  Layers,
  Settings,
  DollarSign,
  Headphones,
  CheckCircle2
} from 'lucide-react'

export const Navbar = () => {
  const { usuario, autenticado, logout, esVendedor, esAdmin, esComprador } = useAuth()
  const { totalItems, setDrawerAbierto } = useCart()
  const { favoriteIds } = useFavorites()
  const { idioma, cambiarIdioma } = useLanguage()
  const [dropdownUser, setDropdownUser] = useState(false)
  const [dropdownLang, setDropdownLang] = useState(false)
  const [dropdownShop, setDropdownShop] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [menuMobile, setMenuMobile] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Si estamos dentro del panel de administrador o panel de vendedor, ocultamos la barra pública
  // para que el panel trabaje a pantalla completa con su propio dock y cabecera profesional.
  const esRutaPanel = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/panel-vendedor') || 
    location.pathname.startsWith('/vendedor')

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [cats, marcs] = await Promise.all([
          productoService.listarCategorias().catch(() => []),
          tiendaService.listarMarcas().catch(() => [])
        ])
        setCategorias(cats || [])
        setMarcas(marcs || [])
      } catch {
        // Fallback silencioso
      }
    }
    cargarFiltros()
  }, [])

  const [navVisible, setNavVisible] = useState(true)
  const prevScrollY = useRef(0)

  // Auto-ocultar al hacer scroll hacia abajo y mostrar de inmediato al subir
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - prevScrollY.current

      // Si está cerca del tope superior, siempre visible
      if (currentScrollY < 50) {
        setNavVisible(true)
      } else if (delta > 8) {
        setNavVisible(false)
        setDropdownShop(false)
        setDropdownUser(false)
        setDropdownLang(false)
      } else if (delta < -8) {
        setNavVisible(true)
      }

      prevScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (esRutaPanel) {
    return null
  }

  const handleLogout = async () => {
    setDropdownUser(false)
    try {
      await logout()
    } catch (e) {
      console.warn('Error en logout:', e)
    }
    window.location.href = '/'
  }

  const esAdminOVendedor = esAdmin || esVendedor

  return (
    <header 
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        navVisible || menuMobile 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* BARRA DE NAVEGACIÓN FULL-WIDTH LIMPIA SIN BORDES DE CAJA */}
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4 sm:gap-6 pointer-events-auto transition-all">
        
        {/* BLOQUE IZQUIERDO: LOGO + DIVISOR SUTIL + NAVEGACIÓN EDITORIAL */}
        <div className="flex items-center gap-4 lg:gap-5 shrink-0">
          {/* LOGO OFICIAL MERCATTO */}
          <Link 
            to="/" 
            className="flex items-center shrink-0 transition-transform"
            title="Ir al inicio de Mercatto"
          >
            <MercattoLogo />
          </Link>

          <span className="hidden lg:block h-5 w-px bg-slate-200/80" />

          {/* ENLACES SUPERIORES SEGÚN EL ROL DEL USUARIO */}
          <nav className="hidden lg:flex items-center gap-1 text-[13.5px] font-semibold text-slate-600">
            
            {/* 1. Catálogo desplegable (disponible para todos para inspeccionar productos) */}
            <div 
              className="relative"
              onMouseEnter={() => setDropdownShop(true)}
              onMouseLeave={() => setDropdownShop(false)}
            >
              <button 
                onClick={() => setDropdownShop(!dropdownShop)}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  location.pathname.startsWith('/catalogo')
                    ? 'text-emerald-800 bg-emerald-50/90 font-bold'
                    : 'hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                <span>Catálogo</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownShop ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {dropdownShop && (
                <div className="absolute top-full left-0 pt-2 w-[420px] z-50 animate-in fade-in">
                  <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] p-4 overflow-hidden text-slate-800">
                    {/* Accesos rápidos superiores */}
                    <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
                      <Link
                        to="/catalogo"
                        onClick={() => setDropdownShop(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 text-xs font-bold text-slate-800 hover:text-emerald-700 transition"
                      >
                        <ShoppingBag size={15} className="text-emerald-600" />
                        <span>Todo el Catálogo</span>
                      </Link>
                      <Link
                        to="/tiendas"
                        onClick={() => setDropdownShop(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 text-xs font-bold text-slate-800 hover:text-emerald-700 transition"
                      >
                        <Store size={15} className="text-violet-600" />
                        <span>Tiendas Oficiales</span>
                      </Link>
                    </div>

                    {/* Contenido Dinámico: Categorías y Marcas de la BD */}
                    <div className="grid grid-cols-2 gap-4 py-3">
                      {/* Categorías */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                          <Layers size={12} className="text-emerald-600" />
                          <span>Categorías</span>
                        </span>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {categorias && categorias.length > 0 ? (
                            categorias.slice(0, 5).map((cat) => (
                              <Link
                                key={cat.id}
                                to={`/catalogo?categoriaId=${cat.id}`}
                                onClick={() => setDropdownShop(false)}
                                className="block px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition truncate"
                              >
                                {cat.nombre}
                              </Link>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Cargando categorías...</span>
                          )}
                        </div>
                      </div>

                      {/* Marcas */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                          <Tag size={12} className="text-violet-500" />
                          <span>Marcas Oficiales</span>
                        </span>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {marcas && marcas.length > 0 ? (
                            marcas.slice(0, 5).map((m) => (
                              <Link
                                key={m}
                                to={`/catalogo?marca=${encodeURIComponent(m)}`}
                                onClick={() => setDropdownShop(false)}
                                className="block px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition truncate"
                              >
                                {m}
                              </Link>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Cargando marcas...</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer del dropdown */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <Link
                        to="/catalogo?orden=ventas"
                        onClick={() => setDropdownShop(false)}
                        className="text-slate-500 hover:text-slate-950 font-medium flex items-center gap-1"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Más Vendidos</span>
                      </Link>
                      <Link
                        to="/catalogo?orden=recientes"
                        onClick={() => setDropdownShop(false)}
                        className="text-slate-500 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <Package size={12} className="text-emerald-500" />
                        <span>Nuevos Productos</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Opciones SOLO para Compradores / Usuarios Generales */}
            {!esAdminOVendedor && (
              <>
                <Link 
                  to="/tiendas" 
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    location.pathname.startsWith('/tienda')
                      ? 'text-emerald-800 bg-emerald-50/90 font-bold'
                      : 'hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Tiendas Oficiales
                </Link>
              </>
            )}

            {/* 3. Botón de acceso exclusivo para VENDEDOR */}
            {esVendedor && (
              <Link 
                to="/panel-vendedor" 
                className="px-4 py-1.5 rounded-full bg-[#051f18] text-emerald-300 hover:bg-emerald-700 hover:text-white transition flex items-center gap-1.5 shadow-xs text-xs font-extrabold ml-1"
                title="Ir a mi panel de vendedor"
              >
                <Store size={14} />
                <span>Panel Vendedor</span>
              </Link>
            )}

            {/* 4. Botón de acceso exclusivo para ADMIN */}
            {esAdmin && (
              <Link 
                to="/admin" 
                className="px-4 py-1.5 rounded-full bg-[#051f18] text-emerald-300 hover:bg-emerald-700 hover:text-white transition flex items-center gap-1.5 shadow-xs text-xs font-extrabold ml-1"
                title="Ir al panel central de administración"
              >
                <Shield size={14} />
                <span>Panel Admin</span>
              </Link>
            )}

          </nav>
        </div>

        {/* BUSCADOR REDONDEADO CENTRAL */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar placeholder={esAdmin ? "Buscar en catálogo o tiendas..." : esVendedor ? "Buscar productos en el mercado..." : "Buscar productos, marcas y tiendas..."} />
        </div>

        {/* ACCIONES Y BOTONES DERECHA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Selector de Idioma (Pastilla limpia sin borde duro) */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => setDropdownLang(!dropdownLang)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/85 hover:bg-slate-200/70 text-xs font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
              title="Cambiar idioma"
            >
              <Globe size={13} className="text-emerald-600" />
              <span>{idioma === 'EN' ? 'EN' : 'ES'}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>
            {dropdownLang && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_rgba(15,23,42,0.12)] py-1.5 z-50 text-xs font-semibold">
                <button 
                  onClick={() => { cambiarIdioma('es'); setDropdownLang(false); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  🇨🇴 Español
                </button>
                <button 
                  onClick={() => { cambiarIdioma('en'); setDropdownLang(false); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  🇺🇸 English
                </button>
              </div>
            )}
          </div>

          <span className="hidden sm:block h-5 w-px bg-slate-200/80" />

          {/* Carrito de Compras (SOLO para compradores, NO vendedor ni admin) */}
          {!esAdminOVendedor && (
            <button
              onClick={() => setDrawerAbierto(true)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition relative flex items-center justify-center cursor-pointer"
              title="Carrito de compras"
            >
              <ShoppingBag size={19} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#051f18] text-emerald-300 text-[10px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center border border-white leading-none select-none">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Favoritos (SOLO para compradores autenticados, NO vendedor ni admin) */}
          {autenticado && !esAdminOVendedor && (
            <Link
              to="/favoritos"
              className="w-9 h-9 rounded-full hover:bg-rose-50 text-slate-700 hover:text-rose-500 transition relative hidden sm:flex items-center justify-center"
              title="Mis Favoritos"
            >
              <Heart size={19} />
              {favoriteIds?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center border border-white leading-none select-none">
                  {favoriteIds.length}
                </span>
              )}
            </Link>
          )}

          {/* Menú de Usuario / Avatar según el Rol */}
          {autenticado ? (
            <div className="relative">
              <button
                onClick={() => setDropdownUser(!dropdownUser)}
                className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-black text-xs shadow-xs border border-slate-200 hover:scale-105 transition cursor-pointer ${
                  esAdmin ? 'bg-violet-700' : esVendedor ? 'bg-[#051f18] text-emerald-300' : 'bg-[#051f18] text-emerald-300'
                }`}
                title="Opciones de cuenta"
              >
                {esAdmin ? 'A' : esVendedor ? 'V' : (usuario?.nombre?.charAt(0).toUpperCase() || 'U')}
              </button>

              {dropdownUser && (
                <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-3xl shadow-2xl py-2 z-50 text-xs font-medium text-slate-700">
                  
                  {/* Encabezado del Perfil */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        esAdmin 
                          ? 'bg-violet-50 text-violet-700 border border-violet-200' 
                          : esVendedor 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {esAdmin ? 'Super Administrador' : esVendedor ? 'Vendedor Verificado' : 'Comprador'}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 truncate">{usuario?.nombre || 'Usuario'}</p>
                    <p className="text-slate-400 text-[11px] truncate">{usuario?.email}</p>
                  </div>

                  {/* CASO 1: OPCIONES EXCLUSIVAS PARA ADMINISTRADOR */}
                  {esAdmin && (
                    <div className="py-1">
                      <Link
                        to="/admin"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-800 hover:bg-violet-50 hover:text-violet-700 font-bold"
                      >
                        <Shield size={15} className="text-violet-600" />
                        <span>Panel Central Admin</span>
                      </Link>
                      <Link
                        to="/admin?tab=vendedores"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Store size={15} />
                        <span>Tiendas & Solicitudes</span>
                      </Link>
                      <Link
                        to="/admin?tab=finanzas"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <DollarSign size={15} />
                        <span>Comisiones & Finanzas (4%)</span>
                      </Link>
                      <Link
                        to="/admin?tab=pedidos"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Package size={15} />
                        <span>Auditoría de Pedidos</span>
                      </Link>
                      <Link
                        to="/admin?tab=soporte"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Headphones size={15} />
                        <span>Tickets de Soporte</span>
                      </Link>
                    </div>
                  )}

                  {/* CASO 2: OPCIONES EXCLUSIVAS PARA VENDEDOR */}
                  {esVendedor && (
                    <div className="py-1">
                      <Link
                        to="/panel-vendedor"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-800 hover:bg-violet-50 hover:text-violet-700 font-bold"
                      >
                        <Store size={15} className="text-violet-600" />
                        <span>Mi Panel de Tienda</span>
                      </Link>
                      <Link
                        to="/panel-vendedor?tab=productos"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Package size={15} />
                        <span>Mis Productos</span>
                      </Link>
                      <Link
                        to="/panel-vendedor?tab=pedidos"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <ShoppingBag size={15} />
                        <span>Pedidos & Envíos</span>
                      </Link>
                      <Link
                        to="/panel-vendedor?tab=mensajes"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <MessageSquare size={15} />
                        <span>Chat con Clientes</span>
                      </Link>
                      <Link
                        to="/panel-vendedor?tab=perfil"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Settings size={15} />
                        <span>Datos de Mi Tienda</span>
                      </Link>
                    </div>
                  )}

                  {/* CASO 3: OPCIONES PARA COMPRADORES NORMALES */}
                  {!esAdminOVendedor && (
                    <div className="py-1">
                      <Link
                        to="/perfil"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <User size={15} />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        to="/mis-pedidos"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Package size={15} />
                        <span>Mis Pedidos</span>
                      </Link>
                      <Link
                        to="/favoritos"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <Heart size={15} />
                        <span>Mis Favoritos</span>
                      </Link>
                      <Link
                        to="/mensajes"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      >
                        <MessageSquare size={15} />
                        <span>Mensajes con Tiendas</span>
                      </Link>
                    </div>
                  )}

                  {/* Cerrar Sesión para todos */}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 transition cursor-pointer font-bold"
                    >
                      <LogOut size={15} />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition flex items-center justify-center cursor-pointer"
              title="Iniciar sesión"
            >
              <User size={19} />
            </Link>
          )}

          {/* Botón menú móvil */}
          <button
            onClick={() => setMenuMobile(!menuMobile)}
            className="text-slate-700 lg:hidden p-1.5 cursor-pointer"
          >
            {menuMobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Menú Móvil desplegable adaptado al Rol */}
      {menuMobile && (
        <div className="lg:hidden w-full bg-white px-4 sm:px-6 py-4 space-y-3 pointer-events-auto">
          <SearchBar placeholder="Buscar en catálogo..." />
          <div className="flex flex-col gap-1 font-bold text-sm text-slate-700">
            <Link to="/catalogo" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl hover:bg-violet-50">
              Catálogo Completo
            </Link>

            {esAdmin && (
              <Link to="/admin" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl bg-violet-50 text-violet-700">
                Panel Administrador
              </Link>
            )}

            {esVendedor && (
              <Link to="/panel-vendedor" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl bg-violet-50 text-violet-700">
                Panel Vendedor
              </Link>
            )}

            {!esAdminOVendedor && (
              <>
                <Link to="/" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl hover:bg-violet-50">Inicio</Link>
                <Link to="/tiendas" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl hover:bg-violet-50">Tiendas Oficiales</Link>
                <Link to="/about" onClick={() => setMenuMobile(false)} className="px-3 py-2 rounded-xl hover:bg-violet-50">Nosotros</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
