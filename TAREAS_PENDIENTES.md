# Tareas Pendientes y Hoja de Ruta - Mercatto

## 1. Guía para Compartir Chatbot IA (n8n + Gemini) a Proyectos Externos
- [ ] **Archivo base:** `mercatto_n8n_ai_workflow.json`
- [ ] **Pasos para proyectos externos:**
  1. Instalar n8n (`npx n8n`).
  2. Importar el JSON en n8n.
  3. Modificar `System Message` en el nodo **AI Agent** con las reglas del nuevo negocio.
  4. Cambiar la ruta en el **Webhook Trigger** (ej. `/mi-app-chat`).
  5. Configurar la clave gratuita de Google Gemini en el nodo Gemini.
  6. Conectar el frontend mediante llamada `fetch(POST)`.

---

## 2. Propuestas de Rediseño Frontend (Home y Catálogo) - En Revisión
- [ ] **Home:**
  - Evaluar alternativas de diseño más atractivas e innovadoras.
  - Franja de beneficios / confianza (envíos, Wompi, 4% de comisión).
  - Rediseño de Hero Banners eliminando textos en inglés.
  - Navegación visual por categorías y ofertas flash.
  - Vitrina de tiendas destacadas.
- [ ] **Catálogo:**
  - Píldoras de filtros activos y vista adaptable.
  - Tarjetas de producto de mayor impacto visual con insignias (descuentos, envío).
  - Filtros facetados colapsables.

---

## 3. Automatización de Entorno
- [ ] Crear script `iniciar_proyecto.bat` para levantar Backend, Frontend y n8n con un solo clic.
