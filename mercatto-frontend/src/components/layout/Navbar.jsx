import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useFavorites } from '../../hooks/useFavorites'
import SearchBar from './SearchBar'
import CategoryMenu from './CategoryMenu'
import { ShoppingBag, Heart, User, LogOut, Store, Shield, Package, Menu, X, Info, Settings, ChevronDown, MessageSquare } from 'lucide-react'

export const Navbar = () => {
  const { usuario, autenticado, logout, esVendedor, esAdmin } = useAuth()
  const { totalItems, setDrawerAbierto } = useCart()
  const { favoriteIds } = useFavorites()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [dropdownUser, setDropdownUser] = useState(false)
  const [dropdownLang, setDropdownLang] = useState(false)
  const [idioma, setIdioma] = useState('ENG')
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    setDropdownUser(false)
    navigate('/')
  }

  return (
    <header className="w-full font-sans">
      {/* Main Header */}
      <div className="bg-white border-b border-slate-100 py-5 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-mercatto-accent p-2 rounded-xl text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-slate-800 leading-none block">
                  Mercatto
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  A Marketplace Theme
                </span>
              </div>
            </Link>

            {/* Search bar (para compradores o visitantes públicos) */}
            {!esVendedor && !esAdmin && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                <SearchBar />
              </div>
            )}

            {/* Search bar compacto exclusivo para el Super Administrador (solo en Catálogo o vista de producto) */}
            {esAdmin && (location.pathname.startsWith('/catalogo') || location.pathname.startsWith('/producto')) && (
              <div className="hidden md:flex flex-1 max-w-md mx-6">
                <SearchBar placeholder="Inspeccionar producto en catálogo..." />
              </div>
            )}

            {/* Panel de Vendedor indicator if Vendedor */}
            {esVendedor && (
              <div className="hidden md:flex flex-1 items-center justify-start ml-6">
                <Link
                  to="/panel-vendedor"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100 hover:bg-indigo-100 transition"
                >
                  <Store size={15} />
                  <span>Espacio de Trabajo / Panel de Vendedor</span>
                </Link>
              </div>
            )}

            {/* Action Links & Icons */}
            <div className="flex items-center gap-5 shrink-0">
              
              {/* Language Selector */}
              <div className="relative hidden sm:block">
                <button 
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-mercatto-accent transition-colors"
                  onClick={() => setDropdownLang(!dropdownLang)}
                >
                  {idioma} <ChevronDown size={14}/>
                </button>
                {dropdownLang && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                    <button 
                      onClick={() => { setIdioma('ENG'); setDropdownLang(false); }}
                      className="block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 text-slate-700"
                    >
                      ENG
                    </button>
                    <button 
                      onClick={() => { setIdioma('Español'); setDropdownLang(false); }}
                      className="block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 text-slate-700"
                    >
                      Español
                    </button>
                  </div>
                )}
              </div>

              {/* Carrito (Solo para compradores o visitantes) */}
              {!esVendedor && !esAdmin && (
                <button
                  onClick={() => setDrawerAbierto(true)}
                  className="text-slate-700 hover:text-mercatto-accent transition relative cursor-pointer"
                  title="Carrito de Compras"
                >
                  <ShoppingBag size={24} />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-mercatto-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              )}

              {/* Favoritos (Solo para compradores) */}
              {autenticado && !esVendedor && !esAdmin && (
                <Link
                  to="/favoritos"
                  className="text-slate-700 hover:text-mercatto-accent transition relative"
                  title="Mis Favoritos"
                >
                  <Heart size={24} />
                  {favoriteIds?.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-mercatto-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {favoriteIds.length}
                    </span>
                  )}
                </Link>
              )}

              {/* Mensajes / Chat */}
              {autenticado && (
                <Link
                  to="/mensajes"
                  className="text-slate-700 hover:text-mercatto-accent transition relative"
                  title={esVendedor ? "Mensajes con Clientes" : "Mis Mensajes & Chat"}
                >
                  <MessageSquare size={24} />
                </Link>
              )}

              {/* User Dropdown / Login */}
              {autenticado ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownUser(!dropdownUser)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-mercatto-accent text-white flex items-center justify-center font-bold text-xs">
                      {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-bold text-slate-700 max-w-[90px] truncate pr-2">
                      {esVendedor ? 'Vendedor' : (usuario?.nombre?.split(' ')[0] || 'Mi Cuenta')}
                    </span>
                  </button>

                  {dropdownUser && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-400">
                          {esVendedor ? 'Cuenta de Proveedor' : 'Conectado como'}
                        </p>
                        <p className="text-sm font-bold text-slate-900 truncate">{usuario?.email}</p>
                      </div>

                      {/* Opciones exclusivas si es Comprador */}
                      {!esVendedor && !esAdmin && (
                        <>
                          <Link
                            to="/perfil"
                            onClick={() => setDropdownUser(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 mt-1"
                          >
                            <User size={16} className="text-slate-400" />
                            <span>Mi Perfil</span>
                          </Link>
                          <Link
                            to="/mis-pedidos"
                            onClick={() => setDropdownUser(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Package size={16} className="text-slate-400" />
                            <span>Mis Pedidos</span>
                          </Link>
                        </>
                      )}

                      {/* Acceso a Mensajes / Chat */}
                      <Link
                        to="/mensajes"
                        onClick={() => setDropdownUser(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        <MessageSquare size={16} />
                        <span>{esVendedor ? 'Mensajes de Clientes' : 'Mensajes'}</span>
                      </Link>

                      {/* Acceso al Panel de Vendedor */}
                      {esVendedor && (
                        <Link
                          to="/panel-vendedor"
                          onClick={() => setDropdownUser(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-mercatto-accent hover:bg-indigo-50"
                        >
                          <Store size={16} />
                          <span>Panel de Vendedor</span>
                        </Link>
                      )}

                      {esAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownUser(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-mercatto-accent hover:bg-indigo-50"
                        >
                          <Shield size={16} />
                          <span>Panel de Administración</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-mercatto-accent transition"
                >
                  <User size={24} />
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="text-slate-700 md:hidden hover:text-mercatto-accent cursor-pointer ml-2"
              >
                {menuAbierto ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="bg-white border-b border-slate-100 shadow-sm hidden md:block">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2.5">
          <nav className="flex gap-2 items-center">
            {esAdmin ? (
              <>
                <Link 
                  to="/admin" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === '/admin' 
                      ? 'bg-rose-600 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                  }`}
                >
                  <Shield size={15} />
                  <span>Panel Global Admin</span>
                </Link>
                <Link 
                  to="/mensajes" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === '/mensajes' 
                      ? 'bg-rose-600 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                  }`}
                >
                  <MessageSquare size={15} />
                  <span>Auditoría de Chats</span>
                </Link>
                <Link 
                  to="/catalogo" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/catalogo' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                  }`}
                >
                  Ver Catálogo Público
                </Link>
              </>
            ) : esVendedor ? (
              <>
                <Link 
                  to="/panel-vendedor" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === '/panel-vendedor' || location.pathname === '/vendedor'
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  <Store size={15} />
                  <span>Panel de Vendedor</span>
                </Link>
                <Link 
                  to="/mensajes" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    location.pathname === '/mensajes' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  <MessageSquare size={15} />
                  <span>Mensajes & Chat con Clientes</span>
                </Link>
                <Link 
                  to="/catalogo" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/catalogo' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  Explorar Marketplace
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/about' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  About Us
                </Link>
                <Link 
                  to="/catalogo" 
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1 ${
                    location.pathname.startsWith('/catalogo') 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                  }`}
                >
                  Shop <ChevronDown size={14}/>
                </Link>
                {!autenticado && (
                  <Link 
                    to="/registro?rol=VENDEDOR" 
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      location.pathname === '/registro' 
                        ? 'bg-slate-800 text-white shadow-md' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                    }`}
                  >
                    Sell on Mercatto
                  </Link>
                )}
                {autenticado && (
                  <>
                    <Link 
                      to="/mis-pedidos" 
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        location.pathname.startsWith('/mis-pedidos') 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                      }`}
                    >
                      Track Order
                    </Link>
                    <Link 
                      to="/favoritos" 
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        location.pathname.startsWith('/favoritos') 
                          ? 'bg-slate-800 text-white shadow-md' 
                          : 'text-slate-700 hover:bg-slate-100 hover:text-mercatto-accent'
                      }`}
                    >
                      Wishlist
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          
          {/* All Category Menu (Solo para compradores y visitantes) */}
          {!esAdmin && !esVendedor && (
            <div className="flex items-center">
              <CategoryMenu />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <div className="md:hidden pb-4 pt-4 border-t border-slate-100 bg-white">
          <div className="px-4 mb-4">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-1 px-3">
            <Link
              to="/catalogo"
              onClick={() => setMenuAbierto(false)}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Catálogo Completo
            </Link>
            {!esVendedor && !esAdmin && (
              <Link
                to="/registro?rol=VENDEDOR"
                onClick={() => setMenuAbierto(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-mercatto-accent hover:bg-indigo-50"
              >
                Vender en Mercatto
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
