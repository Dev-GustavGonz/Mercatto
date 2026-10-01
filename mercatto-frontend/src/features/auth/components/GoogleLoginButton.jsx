import React, { useEffect, useRef } from 'react'
import { GOOGLE_CLIENT_ID } from '@/utils/constants'

/**
 * Botón "Continuar con Google" usando Google Identity Services (GIS).
 * Requiere el script <script src="https://accounts.google.com/gsi/client">
 * cargado en index.html, y VITE_GOOGLE_CLIENT_ID configurado en .env.
 *
 * Props:
 *  - onCredential(credential): recibe el ID Token (JWT) de Google
 *  - texto: texto alternativo del botón (opcional)
 */
export const GoogleLoginButton = ({ onCredential, texto = 'continue_with' }) => {
  const contenedorRef = useRef(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    let intentos = 0
    const inicializar = () => {
      if (!window.google?.accounts?.id) {
        // El script se carga con "defer", puede que aún no esté listo
        if (intentos++ < 20) return setTimeout(inicializar, 150)
        return
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredential?.(response.credential),
      })
      if (contenedorRef.current) {
        window.google.accounts.id.renderButton(contenedorRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: texto,
          shape: 'pill',
          width: 320,
        })
      }
    }
    inicializar()
  }, [onCredential, texto])

  if (!GOOGLE_CLIENT_ID) return null

  return <div className="flex justify-center" ref={contenedorRef} />
}

export default GoogleLoginButton
