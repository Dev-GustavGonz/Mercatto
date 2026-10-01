import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import { HelpCircle, ArrowLeft } from 'lucide-react'

export const NotFound = () => {
  return (
    <div className="py-32 text-center max-w-md mx-auto space-y-4 px-4">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mx-auto">
        <HelpCircle size={32} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Página no encontrada</h2>
      <p className="text-xs text-slate-500">
        La página o el producto que estás buscando no existe o ha sido movido.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          <span>Volver al Inicio</span>
        </Button>
      </Link>
    </div>
  )
}

export default NotFound
