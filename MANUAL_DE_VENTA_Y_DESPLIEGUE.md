# 🛍️ MERCATTO MARKETPLACE — MANUAL COMERCIAL, TÉCNICO Y DE ENTREGA

> **Plataforma Integral de Comercio Electrónico Multi-Vendedor (B2C & C2C)**  
> Con Pasarela de Pagos Colombiana (Wompi Bancolombia), Agente de IA (Gemini / n8n), Chat en Tiempo Real (WebSockets STOMP) y Panel de Control Financiero.

---

## 📌 1. RESUMEN EJECUTIVO (PITCH DE VENTA)

**Mercatto** es una solución de comercio electrónico lista para producción ("Turnkey / Llave en mano") diseñada para conectar a múltiples proveedores y marcas con compradores en toda Colombia y Latinoamérica. 

A diferencia de plantillas básicas de e-commerce, Mercatto incorpora infraestructura empresarial:
- **Gestión Multi-Tienda Independiente:** Cada vendedor administra sus propios productos, pedidos, ingresos y métricas.
- **Cobro de Comisiones de la Plataforma:** Sistema automático de comisión del 4% sobre cada venta transaccionada.
- **Pasarela de Pagos Colombiana:** Integración oficial con **Wompi Bancolombia** (Tarjetas Visa/Mastercard, Transferencias Bancarias, PSE, Nequi y Pago Contra Entrega).
- **Asistente Virtual con Inteligencia Artificial:** Soporte de ventas 24/7 impulsado por Google Gemini y flujos de n8n.
- **Comunicación en Tiempo Real:** Chat directo e instantáneo entre compradores y vendedores mediante WebSockets STOMP.
- **Cumplimiento Legal Colombiano:** Términos de servicio, derecho de retracto (Ley 1480 de 2011) y Habeas Data (Ley 1581 de 2012).

---

## 💼 2. MODELO DE MONETIZACIÓN

El propietario del software puede monetizar la plataforma a través de 4 canales:
1. **Comisión por Transacción (Take Rate):** Cobro automático configurable (por defecto 4% o hasta el 12%) sobre cada venta liquidada.
2. **Planes de Membresía / Suscripción para Tiendas:** Modalidad de membresía destacada para vendedores con insignia de verificación y mayor visibilidad en vitrinas.
3. **Comisión de Envíos y Logística:** Margen sobre convenios con transportadoras aliadas (Coordinadora, Servientrega, Envia).
4. **Venta de Banners y Productos Patrocinados:** Posicionamiento destacado en el Hero dinámico de la página principal.

---

## 🔑 3. USUARIOS Y CREDENCIALES DE DEMOSTRACIÓN

El sistema incluye usuarios pre-sembrados en la base de datos para pruebas inmediatas:

| Rol | Correo Electrónico | Contraseña | Destino tras Login | Funcionalidad Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@mercatto.com` | `123456` | `/admin` | Control total del marketplace, aprobación de tiendas, visualización de comisiones del 4%, gestión de usuarios y pedidos. |
| **Vendedor Oficial** | `vendedor@mercatto.com` | `123456` | `/vendedor` | Gestión de inventario, adición de productos y variantes, despacho de órdenes con número de guía y métricas de ingresos netos (96%). |
| **Comprador** | `comprador@mercatto.com` | `123456` | `/` | Carrito de compras, lista de deseos/favoritos, checkout y consulta de mis pedidos. |
| **Comprador Invitado** | *(Sin registro)* | *(N/A)* | `/checkout` | Compra express sin crear cuenta y rastreo en tiempo real en `/rastreo`. |

---

## 🏗️ 4. ARQUITECTURA Y STACK TECNOLÓGICO

```
┌────────────────────────────────────────────────────────┐
│                   MERCATTO PLATFORM                    │
├──────────────────────────┬─────────────────────────────┤
│ Frontend (React 18)      │ Backend (Spring Boot 3)     │
│ • Vite 5 + Tailwind CSS  │ • Java 21 LTS               │
│ • React Router DOM v6    │ • Spring Data JPA / MySQL 8 │
│ • WebSockets STOMP Client│ • Spring Security + JWT     │
│ • Wompi Checkout Widget  │ • WebSocket Message Broker  │
│ • Favicon SVG de Marca   │ • Cloudinary + JavaMail     │
├──────────────────────────┴─────────────────────────────┤
│ Integraciones & Automatización                         │
│ • n8n Workflow Engine (Puerto 5678)                    │
│ • Google Gemini AI Model (models/gemini-2.0-flash)     │
│ • Wompi Pasarela Bancolombia (Integrity SHA-256)       │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 5. GUÍA DE PUESTA EN MARCHA RÁPIDA

### Opción A: Modo Local con Scripts de 1 Clic (Recomendado para Demostración en Windows)

1. **Iniciar todo:**
   Haz doble clic sobre el archivo raíz:
   ```cmd
   iniciar_todo.bat
   ```
   *Este script verifica MySQL (3306), lanza el Backend (8080), el Frontend (5173) y n8n (5678) en consolas independientes y abre automáticamente las pestañas en tu navegador.*

2. **Detener todo:**
   Haz doble clic sobre:
   ```cmd
   detener_todo.bat
   ```
   *Libera limpiamente todos los puertos de memoria.*

---

### Opción B: Despliegue con Docker (Para Producción o VPS en la Nube)

En cualquier servidor Linux, Windows o Mac con Docker instalado:

```bash
docker compose up -d --build
```

Esto desplegará en contenedores aislados:
- Base de datos MySQL 8 (`mercatto-mysql:3306`)
- API Spring Boot (`mercatto-backend:8080`)
- Frontend Nginx Web Server (`mercatto-frontend:80`)
- Servidor de Inteligencia Artificial n8n (`mercatto-n8n:5678`)

---

## 🛡️ 6. SEGURIDAD Y BLINDAJE APLICADO

1. **Protección Anti-Fraude en Pagos:** Eliminada cualquier auto-aprobación falsa. Si la pasarela de Wompi se cierra o se bloquea por extensiones, el pedido permanece estrictamente en estado `PENDIENTE` y solo se confirma con respuesta bancaria autorizada.
2. **Variables de Entorno Limpias:** Creados `mercatto-backend/src/main/resources/application.properties.example` y `mercatto-frontend/.env.example` para que ninguna contraseña personal quede expuesta en repositorios públicos.
3. **Módulo Público de Rastreo:** Los compradores invitados pueden verificar el estado y transportadora de su paquete en `/rastreo` usando solo su código de orden y correo.
4. **Identidad de Marca Unificada:** Favicon SVG oficial (`favicon.svg`) e isotipos responsivos en docks de administración sin errores 404 en consola.

---

## 📦 7. ESTRUCTURA DE ARCHIVOS CLAVE DEL PROYECTO

```
c:\proyecto\Mercatto\
├── iniciar_todo.bat                  <- Lanzador automatizado local
├── detener_todo.bat                  <- Apagado seguro de servicios
├── docker-compose.yml                <- Despliegue en producción con 1 comando
├── MANUAL_DE_VENTA_Y_DESPLIEGUE.md   <- Este manual
├── mercatto_n8n_ai_workflow.json     <- Flujo del agente IA de Gemini para n8n
│
├── mercatto-backend/                 <- API REST Spring Boot (Java 21)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/resources/
│       ├── application.properties
│       └── application.properties.example
│
└── mercatto-frontend/                <- SPA React 18 + Vite
    ├── Dockerfile
    ├── nginx.conf
    ├── .env
    ├── .env.example
    ├── public/favicon.svg            <- Favicon oficial de la marca
    └── src/
        ├── features/pedidos/pages/RastreoPedido.jsx
        ├── features/public/pages/Terminos.jsx
        └── features/public/pages/Privacidad.jsx
```

---

*Mercatto Marketplace — Listo para ser entregado, cotizado y comercializado.*
