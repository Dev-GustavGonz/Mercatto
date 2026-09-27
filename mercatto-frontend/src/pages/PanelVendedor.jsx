import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import vendedorService from '../services/vendedorService'
import productoService from '../services/productoService'
import pedidoService from '../services/pedidoService'
import VendorStats from '../components/vendor/VendorStats'
import ProductForm from '../components/vendor/ProductForm'
import OrdersTable from '../components/vendor/OrdersTable'
import VendorProfile from '../components/vendor/VendorProfile'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import { formatCurrency } from '../utils/formatCurrency'
import { Store, Package, ShoppingCart, MessageSquare, Settings, Plus, Edit, Trash2, Send, Search } from 'lucide-react'

export const PanelVendedor = () => {
  const { usuario } = useAuth()
  const [tab, setTab] = useState('productos')
  const [stats, setStats] = useState({})
  const [perfil, setPerfil] = useState(null)
  const [productos, setProductos] = useState([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [pedidos, setPedidos] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(true)

  // Sub-estados
  const [modoCrear, setModoCrear] = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [respuestaMsg, setRespuestaMsg] = useState('')
  const [msgSeleccionado, setMsgSeleccionado] = useState(null)

  const cargarTodo = async () => {
    setLoading(true)
    try {
      const [st, pf, pds, ords, msgs] = await Promise.all([
        vendedorService.obtenerEstadisticas(),
        vendedorService.obtenerPerfil(),
        productoService.listar({ pagina: 0, tamano: 50 }),
        pedidoService.pedidosVendedor(),
        vendedorService.bandejaMensajes(),
      ])
      setStats(st || {})
      setPerfil(pf)
      setProductos(pds.content || [])
      setPedidos(ords.content || [])
      setMensajes(msgs.content || [])
    } catch {
      // Manejado
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  const handleEliminarProducto = async (id) => {
    if (!window.confirm('¿Deseas deshabilitar este producto?')) return
    try {
      await productoService.eliminar(id)
      cargarTodo()
    } catch {}
  }

  const handleResponderMensaje = async (e) => {
    e.preventDefault()
    if (!respuestaMsg.trim() || !msgSeleccionado) return
    try {
      await productoService.enviarMensajeContacto(
        msgSeleccionado.producto.id,
        respuestaMsg.trim(),
        `Re: ${msgSeleccionado.asunto}`
      )
      setRespuestaMsg('')
      setMsgSeleccionado(null)
      cargarTodo()
    } catch {}
  }

  if (loading) {
    return <Spinner size="lg" className="py-24" />
  }

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            <Store size={28} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
              Panel de Proveedor
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {perfil?.nombreTienda || 'Mi Tienda Virtual'}
            </h1>
            <p className="text-xs text-slate-400">
              {perfil?.ciudad || 'Colombia'} • {usuario?.email}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setProductoEditar(null)
            setModoCrear(true)
            setTab('productos')
          }}
        >
          <Plus size={16} className="mr-1.5" />
          <span>Publicar Producto</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <VendorStats stats={stats} />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'productos', label: `Mis Productos (${productos.length})`, icon: Package },
          { id: 'pedidos', label: `Pedidos Recibidos (${pedidos.length})`, icon: ShoppingCart },
          { id: 'mensajes', label: `Preguntas de Clientes (${mensajes.length})`, icon: MessageSquare },
          { id: 'perfil', label: 'Datos de Tienda', icon: Settings },
        ].map((t) => {
          const Icon = t.icon
          const activo = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id)
                setModoCrear(false)
                setProductoEditar(null)
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activo
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Productos */}
      {tab === 'productos' && (
        <div className="space-y-6">
          {modoCrear || productoEditar ? (
            <ProductForm
              productoInicial={productoEditar}
              onGuardado={() => {
                setModoCrear(false)
                setProductoEditar(null)
                cargarTodo()
              }}
              onCancelar={() => {
                setModoCrear(false)
                setProductoEditar(null)
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Buscador de productos del vendedor */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    placeholder="Buscar en tus productos por título o SKU..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                  {busquedaProducto && (
                    <button
                      onClick={() => setBusquedaProducto('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-400 self-center">
                  Mostrando {productos.filter(p => !busquedaProducto || p.titulo?.toLowerCase().includes(busquedaProducto.toLowerCase()) || p.sku?.toLowerCase().includes(busquedaProducto.toLowerCase())).length} de {productos.length} productos
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3.5">Producto</th>
                        <th className="p-3.5">Categoría</th>
                        <th className="p-3.5">Precio</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5">Estado</th>
                        <th className="p-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {productos
                        .filter(p => !busquedaProducto || p.titulo?.toLowerCase().includes(busquedaProducto.toLowerCase()) || p.sku?.toLowerCase().includes(busquedaProducto.toLowerCase()))
                        .map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={prod.imagenes?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{prod.titulo}</p>
                            <p className="text-[10px] text-slate-400">SKU: {prod.sku}</p>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{prod.categoria?.nombre}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{formatCurrency(prod.precio)}</td>
                        <td className="p-3.5 font-semibold">{prod.stock} un.</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {prod.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setProductoEditar(prod)
                              setModoCrear(false)
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleEliminarProducto(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Tab 2: Pedidos */}
      {tab === 'pedidos' && (
        <OrdersTable pedidos={pedidos} onPedidoActualizado={cargarTodo} />
      )}

      {/* Tab 3: Mensajes / Consultas de Compradores */}
      {tab === 'mensajes' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 p-5 rounded-2xl border border-indigo-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" />
                <span>Centro de Mensajería y Chat en Vivo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Responde en tiempo real a los clientes que te contactan desde tus publicaciones.
              </p>
            </div>
            <a
              href="/mensajes"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <MessageSquare size={14} />
              <span>Abrir Chat en Vivo</span>
            </a>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {mensajes.length === 0 ? (
              <p className="p-8 text-center text-xs text-slate-400">No tienes consultas archivadas de clientes.</p>
            ) : (
              mensajes.map((m) => (
                <div key={m.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{m.comprador?.nombre || 'Cliente'}</span>
                      <p className="text-[11px] text-indigo-600 font-semibold">Producto: {m.producto?.titulo}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{m.fechaEnvio ? new Date(m.fechaEnvio).toLocaleString('es-CO') : ''}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    {m.mensaje}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setMsgSeleccionado(m)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Send size={12} />
                      <span>Responder al Cliente</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {msgSeleccionado && (
            <form onSubmit={handleResponderMensaje} className="bg-indigo-50/50 dark:bg-slate-800 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                Responder a {msgSeleccionado.comprador?.nombre} sobre "{msgSeleccionado.producto?.titulo}"
              </h4>
              <textarea
                rows={2}
                placeholder="Escribe tu respuesta para el comprador..."
                value={respuestaMsg}
                onChange={(e) => setRespuestaMsg(e.target.value)}
                className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                required
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setMsgSeleccionado(null)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Enviar Respuesta</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 4: Perfil de Tienda */}
      {tab === 'perfil' && (
        <VendorProfile perfil={perfil} onPerfilActualizado={cargarTodo} />
      )}
    </div>
  )
}

export default PanelVendedor
