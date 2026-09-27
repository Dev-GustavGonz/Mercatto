import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'

// Pages
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import Catalogo from './pages/Catalogo'
import DetalleProducto from './pages/DetalleProducto'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import MisPedidos from './pages/MisPedidos'
import Favoritos from './pages/Favoritos'
import Login from './pages/Login'
import Registro from './pages/Registro'
import PanelVendedor from './pages/PanelVendedor'
import PanelAdmin from './pages/PanelAdmin'
import NotFound from './pages/NotFound'

// Protected Route Wrapper for Vendor
const RutaVendedor = ({ children }) => {
  const { autenticado, esVendedor, esAdmin, cargando } = useAuth()
  if (cargando) return null
  if (!autenticado || (!esVendedor && !esAdmin)) {
    return <Navigate to="/login" replace />
  }
  return children
}

// Protected Route Wrapper for Admin
const RutaAdmin = ({ children }) => {
  const { autenticado, esAdmin, cargando } = useAuth()
  if (cargando) return null
  if (!autenticado || !esAdmin) {
    return <Navigate to="/login" replace />
  }
  return children
}

import Perfil from './pages/Perfil'
import Mensajes from './pages/Mensajes'

// Protected Route Wrapper for Logged-in Buyers
const RutaProtegida = ({ children }) => {
  const { autenticado, cargando } = useAuth()
  if (cargando) return null
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
              <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
                <Navbar />
                <CartDrawer />

                <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                  <Routes>
                    {/* Public Marketplace routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/catalogo" element={<Catalogo />} />
                    <Route path="/producto/:id" element={<DetalleProducto />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Buyer protected routes */}
                    <Route path="/checkout" element={<Checkout />} />
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
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
