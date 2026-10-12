import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Hemos restablecido la sesión
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Para garantizar la seguridad de tu cuenta y cargar la tienda fresca, pulsa el botón para continuar.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Volver a la Tienda Principal</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
