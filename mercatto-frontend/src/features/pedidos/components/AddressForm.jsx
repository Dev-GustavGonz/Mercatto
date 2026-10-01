import React from 'react'
import Input from '@/components/common/Input'

export const AddressForm = ({ direccion, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...direccion, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre y Apellidos de quien recibe"
          placeholder="Ej: Juan Pérez"
          value={direccion.nombreCompleto || ''}
          onChange={(e) => handleChange('nombreCompleto', e.target.value)}
          required
        />
        <Input
          label="Teléfono de contacto"
          placeholder="Ej: 3001234567"
          value={direccion.telefono || ''}
          onChange={(e) => handleChange('telefono', e.target.value)}
          required
        />
      </div>

      <Input
        label="Dirección de Entrega (Calle, Carrera, Número, Apto)"
        placeholder="Ej: Calle 100 # 15-20 Apto 402"
        value={direccion.direccion || ''}
        onChange={(e) => handleChange('direccion', e.target.value)}
        required
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Input
          label="Barrio"
          placeholder="Ej: El Poblado"
          value={direccion.barrio || ''}
          onChange={(e) => handleChange('barrio', e.target.value)}
        />
        <Input
          label="Ciudad"
          placeholder="Ej: Medellín"
          value={direccion.ciudad || ''}
          onChange={(e) => handleChange('ciudad', e.target.value)}
          required
        />
        <Input
          label="Departamento"
          placeholder="Ej: Antioquia"
          value={direccion.departamento || ''}
          onChange={(e) => handleChange('departamento', e.target.value)}
          required
        />
      </div>

      <Input
        label="Instrucciones o notas para la entrega (opcional)"
        placeholder="Ej: Dejar en portería o tocar el timbre blanco"
        value={direccion.notasEntrega || ''}
        onChange={(e) => handleChange('notasEntrega', e.target.value)}
      />
    </div>
  )
}

export default AddressForm
