import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../utils/translations'

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [idioma, setIdioma] = useState(() => {
    return localStorage.getItem('mercatto_idioma') || 'es'
  })

  useEffect(() => {
    localStorage.setItem('mercatto_idioma', idioma)
    document.documentElement.lang = idioma
  }, [idioma])

  const cambiarIdioma = (nuevoIdioma) => {
    setIdioma(nuevoIdioma.toLowerCase())
  }

  const t = (clave) => {
    const lang = translations[idioma] || translations.es
    return lang[clave] || translations.es[clave] || clave
  }

  return (
    <LanguageContext.Provider value={{ idioma: idioma.toUpperCase(), cambiarIdioma, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de LanguageProvider')
  }
  return context
}

export default LanguageContext
