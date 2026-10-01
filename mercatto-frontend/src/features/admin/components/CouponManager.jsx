import React, { useState, useEffect } from 'react'
import { adminService } from '@/features/admin'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import { useToast } from '@/hooks/useToast'
import { Plus, Trash2, Tag } from 'lucide-react'

export const CouponManager = () => {
  const [cupones, setCupones] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [tipo, setTipo] = useState('PORCENTAJE')
  const [valor, setValor] = useState(10)
  const [montoMinimo, setMontoMinimo] = useState(50000)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const cargar = () => {
    adminService.listarCupones().then((data) => setCupones(data || [])).catch(() => {})
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleCrear = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminService.crearCupon({
        codigo: codigo.trim().toUpperCase(),
        tipo,
        valor: Number(valor),
        montoMinimo: Number(montoMinimo),
        activo: true,
      })
      success('Cupón creado exitosamente')
      setModalAbierto(false)
      cargar()
    } catch (err) {
      error(err.response?.data?.mensaje || 'Error al crear cupón')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar cupón?')) return
    try {
      await adminService.eliminarCupon(id)
      success('Cupón eliminado')
      cargar()
    } catch {
      error('Error al eliminar cupón')
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Cupones de Descuento</h3>
          <p className="text-xs text-slate-500">Crea promociones y códigos para los compradores.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setModalAbierto(true)}>
          <Plus size={14} className="mr-1" />
          <span>Nuevo Cupón</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {cupones.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Tag size={13} className="text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.codigo}</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Descuento: {c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `$${c.valor}`} (Mínimo: ${c.montoMinimo})
              </p>
            </div>
            <button onClick={() => handleEliminar(c.id)} className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal isOpen={true} onClose={() => setModalAbierto(false)} title="Crear Cupón de Descuento">
          <form onSubmit={handleCrear} className="space-y-4">
            <Input label="Código del Cupón" placeholder="Ej: VERANO2024" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="PORCENTAJE">Porcentaje (%)</option>
                  <option value="MONTO_FIJO">Monto Fijo (COP)</option>
                </select>
              </div>
              <Input label="Valor del Descuento" type="number" value={valor} onChange={(e) => setValor(e.target.value)} required />
            </div>
            <Input label="Monto Mínimo de Compra" type="number" value={montoMinimo} onChange={(e) => setMontoMinimo(e.target.value)} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" loading={loading}>Crear Cupón</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default CouponManager
