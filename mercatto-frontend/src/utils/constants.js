export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, '')

export const getMediaUrl = (url, fallback) => {
  if (!url) return fallback || ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${SERVER_URL}${cleanPath}`
}

// Debe coincidir EXACTAMENTE con google.client-id en application.properties del backend
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const ROLES = {
  COMPRADOR: 'COMPRADOR',
  VENDEDOR: 'VENDEDOR',
  ADMIN: 'ADMIN',
}

export const ESTADOS_PEDIDO = {
  PENDIENTE: { label: 'Pendiente de Pago', color: 'yellow' },
  PAGADO: { label: 'Pagado / Confirmado', color: 'blue' },
  EN_PREPARACION: { label: 'En Preparación', color: 'indigo' },
  ENVIADO: { label: 'En Camino', color: 'purple' },
  ENTREGADO: { label: 'Entregado', color: 'green' },
  CANCELADO: { label: 'Cancelado', color: 'red' },
  REEMBOLSADO: { label: 'Reembolsado', color: 'gray' },
}

export const METODOS_PAGO = [
  { id: 'WOMPI', nombre: 'Tarjeta de Crédito / Débito', icono: 'CreditCard' },
  { id: 'NEQUI', nombre: 'Nequi / Daviplata Directo', icono: 'Smartphone' },
  { id: 'PSE', nombre: 'PSE / Transferencia Bancaria', icono: 'Building' },
  { id: 'CONTRA_ENTREGA', nombre: 'Pago Contra Entrega (Efectivo)', icono: 'Truck' },
]
