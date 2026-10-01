import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
// Common Layout & Components
import CartDrawer from './components/cart/CartDrawer'
import PublicChatbot from './components/common/PublicChatbot'
import Spinner from './components/common/Spinner'

// General Pages
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import NotFound from './pages/NotFound'

// Domain / Feature Entities
import { Login, Registro } from './features/auth'
import { Catalogo, DetalleProducto, Categoria, Busqueda, Favoritos } from './features/productos'
import { Carrito, Checkout, MisPedidos, PagoExitoso, PagoCancelado } from './features/pedidos'
import { DirectorioTiendas, VitrinaTienda, PanelVendedor } from './features/tiendas'
import { PanelAdmin } from './features/admin'
import { Perfil } from './features/perfil'
import { Mensajes } from './features/mensajes'


// Protected Route Wrapper for Vendor
const RutaVendedor = ({ children }) => {
  const { autenticado, esVendedor, esAdmin, cargando } = useAuth()
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!autenticado || (!esVendedor && !esAdmin)) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Protected Route Wrapper for Admin
const RutaAdmin = ({ children }) => {
  const { autenticado, esAdmin, cargando } = useAuth()
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!autenticado || !esAdmin) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Protected Route Wrapper for Logged-in Buyers
const RutaProtegida = ({ children }) => {
  const { autenticado, cargando } = useAuth()
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />
  }
  return children
}

import ScrollToTop from './components/common/ScrollToTop'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <LanguageProvider>
                <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
                  <Navbar />
                  <CartDrawer />
                  <PublicChatbot />

                <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                  <Routes>
                    {/* Public Marketplace routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/categoria/:id" element={<Categoria />} />
                    <Route path="/buscar" element={<Busqueda />} />
                    <Route path="/tiendas" element={<DirectorioTiendas />} />
                    <Route path="/tienda/:id" element={<VitrinaTienda />} />
                    <Route path="/producto/:id" element={<DetalleProducto />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Buyer protected routes */}
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/pago/exitoso" element={<PagoExitoso />} />
                    <Route path="/pago/cancelado" element={<PagoCancelado />} />
                    <Route
                      path="/perfil"
                      element={
                        <RutaProtegida>
                          <Perfil />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="/mis-pedidos"
                      element={
                        <RutaProtegida>
                          <MisPedidos />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="/favoritos"
                      element={
                        <RutaProtegida>
                          <Favoritos />
                        </RutaProtegida>
                      }
                    />
                    <Route
                      path="/mensajes"
                      element={
                        <RutaProtegida>
                          <Mensajes />
                        </RutaProtegida>
                      }
                    />

                    {/* Vendor Panel */}
                    <Route
                      path="/vendedor"
                      element={
                        <RutaVendedor>
                          <PanelVendedor />
                        </RutaVendedor>
                      }
                    />
                    <Route
                      path="/panel-vendedor"
                      element={
                        <RutaVendedor>
                          <PanelVendedor />
                        </RutaVendedor>
                      }
                    />

                    {/* Admin Panel */}
                    <Route
                      path="/admin"
                      element={
                        <RutaAdmin>
                          <PanelAdmin />
                        </RutaAdmin>
                      }
                    />

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>

                <Footer />
              </div>
              </LanguageProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
