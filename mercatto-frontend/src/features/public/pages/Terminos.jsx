import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export const Terminos = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-black uppercase tracking-wider">
          <FileText size={14} />
          <span>Marco Legal y Condiciones</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-xs text-slate-500">
          Última actualización: Octubre de 2026 • Conforme a la Ley 1480 de 2011 (Estatuto del Consumidor de Colombia)
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">1.</span> Naturaleza del Servicio y Marketplace
          </h2>
          <p>
            <strong>Mercatto</strong> es una plataforma tecnológica de intermediación de comercio electrónico (Marketplace) que conecta a compradores con tiendas y vendedores independientes verificados en Colombia. Mercatto facilita la infraestructura técnica, procesamiento de pagos seguros e integración logística.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">2.</span> Registro de Cuentas y Responsabilidad
          </h2>
          <p>
            Los usuarios pueden navegar y comprar como invitados o como usuarios registrados. Toda información suministrada en el proceso de compra o registro debe ser veraz y vigente. Los vendedores están obligados a registrar información legal válida (Cédula o NIT) y a cumplir con los inventarios ofertados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">3.</span> Pasarelas de Pago y Seguridad Transaccional
          </h2>
          <p>
            Los pagos electrónicos se procesan a través de entidades financieras vigiladas por la Superintendencia Financiera de Colombia (Wompi Bancolombia, PSE y Redes ACH). Mercatto <strong>no almacena</strong> números de tarjetas de crédito ni claves bancarias en sus servidores; todas las transacciones se realizan bajo cifrado SSL/TLS de 256 bits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">4.</span> Derecho de Retracto (Estatuto del Consumidor)
          </h2>
          <p>
            En cumplimiento del artículo 47 de la Ley 1480 de 2011, el comprador tiene derecho a ejercer el retracto dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la entrega del producto, siempre y cuando este conserve sus etiquetas originales, no presente señales de uso y se encuentre en su empaque original. Los costos de flete por devolución corresponden al usuario según la normativa legal aplicable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">5.</span> Envíos, Despachos y Guías de Seguimiento
          </h2>
          <p>
            Los tiempos de entrega oscilan entre 2 y 5 días hábiles en ciudades principales de Colombia. Cada pedido cuenta con número de guía oficial asignado por empresas de mensajería certificadas (Coordinadora, Servientrega, Envia o TCC) visible en el panel del comprador o mediante el módulo de rastreo público.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">6.</span> Atención al Cliente y Solución de Controversias
          </h2>
          <p>
            Para consultas o reclamos, los usuarios pueden comunicarse con el equipo de soporte a través de <strong>soporte@mercatto.com</strong>, el chat con inteligencia artificial integrado en la plataforma o mediante nuestra línea directa de WhatsApp oficial.
          </p>
        </section>
      </div>

      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700 transition">
          <ArrowLeft size={16} />
          <span>Volver a la tienda</span>
        </Link>
        <Link to="/privacidad" className="text-xs font-bold text-slate-500 hover:text-violet-600 transition">
          Ver Política de Privacidad y Tratamiento de Datos →
        </Link>
      </div>
    </div>
  )
}

export default Terminos
