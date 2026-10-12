import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react'

export const Privacidad = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      {/* Encabezado */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-black uppercase tracking-wider">
          <ShieldCheck size={14} />
          <span>Habeas Data & Seguridad</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Política de Privacidad y Tratamiento de Datos
        </h1>
        <p className="text-xs text-slate-500">
          Última actualización: Octubre de 2026 • Conforme a la Ley 1581 de 2012 y Decreto 1377 de 2013 de Colombia
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        
        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">1.</span> Responsable del Tratamiento
          </h2>
          <p>
            <strong>Mercatto Marketplace</strong>, con domicilio en Colombia, actúa como responsable del tratamiento de los datos personales suministrados por los titulares (clientes compradores, proveedores y vendedores) en el portal web y aplicaciones asociadas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">2.</span> Datos que Recopilamos y Finalidad
          </h2>
          <p>
            Recopilamos únicamente los datos indispensables para ejecutar las compras y despachos de productos:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
            <li><strong>Nombre, Teléfono y Dirección:</strong> Para coordinar la entrega física con las empresas transportadoras.</li>
            <li><strong>Correo Electrónico:</strong> Para emitir comprobantes de pago, facturas electrónicas y notificaciones de rastreo.</li>
            <li><strong>Identificación (Cédula o NIT):</strong> Requerido por transportadoras y la DIAN para emisión de guías y facturación.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">3.</span> Confidencialidad y No Venta de Datos
          </h2>
          <p>
            Mercatto <strong>jamás vende, alquila ni comercializa</strong> las bases de datos de sus usuarios con terceros ajenos a la transacción comercial. Los datos se comparten exclusivamente con la pasarela de pago bancaria certificada y la empresa transportadora asignada a cada pedido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">4.</span> Derechos del Titular (Habeas Data)
          </h2>
          <p>
            Todo usuario titular de datos tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos de nuestros registros en cualquier momento, enviando una comunicación al correo <strong>privacidad@mercatto.com</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-violet-600 font-bold">5.</span> Cifrado y Medidas de Seguridad
          </h2>
          <p>
            Implementamos protocolos de seguridad estándar de la industria (HTTPS / TLS, hashing BCrypt para contraseñas, tokens JWT cifrados y cookies HttpOnly) para salvaguardar la integridad de la información contra accesos no autorizados.
          </p>
        </section>
      </div>

      <div className="flex justify-between items-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-700 transition">
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </Link>
        <Link to="/terminos" className="text-xs font-bold text-slate-500 hover:text-violet-600 transition">
          Ver Términos y Condiciones →
        </Link>
      </div>
    </div>
  )
}

export default Privacidad
