import React from 'react'

/**
 * MercattoLogo - Componente de marca oficial de Mercatto.
 * - Modo Completo (por defecto): Muestra la palabra "Mercatto" con su tipografía fluida y audaz en violeta.
 * - Modo Isotipo (showText={false}): Muestra únicamente la "M" estilizada para barras laterales,
 *   docks cuadrados (w-10 h-10) y avatares compactos sin desbordamiento.
 */
export const MercattoLogo = ({ className = '', showText = true, size = 28 }) => {
  if (!showText) {
    return (
      <span 
        className={`inline-flex items-center justify-center font-['Pacifico',cursive] font-normal text-violet-600 dark:text-violet-400 select-none leading-none ${className}`}
        style={{
          fontFamily: "'Pacifico', 'Caveat', cursive, sans-serif",
          fontSize: `${size}px`,
          lineHeight: 1
        }}
        title="Mercatto"
      >
        M
      </span>
    )
  }

  return (
    <span 
      className={`inline-block font-['Pacifico',cursive] text-2xl sm:text-3xl font-normal text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-all duration-200 select-none tracking-wide hover:scale-105 drop-shadow-[0_1px_6px_rgba(139,92,246,0.18)] ${className}`}
      style={{
        fontFamily: "'Pacifico', 'Caveat', cursive, sans-serif"
      }}
    >
      Mercatto
    </span>
  )
}

export default MercattoLogo
