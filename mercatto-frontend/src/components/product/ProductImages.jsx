import React, { useState } from 'react'

export const ProductImages = ({ imagenes = [], titulo = 'Producto' }) => {
  const defaultImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  const lista = imagenes.length > 0 ? imagenes : [{ id: 0, url: defaultImage }]
  const [activa, setActiva] = useState(lista[0]?.url || defaultImage)

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {lista.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-96 pb-2 md:pb-0">
          {lista.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiva(img.url)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                activa === img.url ? 'border-indigo-600 scale-95 shadow-md' : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <img
          src={activa}
          alt={titulo}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  )
}

export default ProductImages