# Manual Paso a Paso (Azure en Español): Despliegue de Mercatto

Esta guía contiene los nombres y botones **exactos en español** tal como aparecen en tu portal de Azure.

---

## 📌 Datos de tu Servidor en Azure
* **Nombre de tu App:** `mercatto-backend-api`
* **Grupo de recursos:** `rg-mercatto-prod`
* **URL pública final:** `https://mercatto-backend-api.azurewebsites.net`
* **Archivo listo en tu PC:** `C:\Users\gjgh2\Downloads\mercatto\mercatto-backend\target\app.jar`

---

## 🛠️ PASO 1: Configurar Variables y "Siempre Activado"

1. En el portal de Azure, abre tu recurso **`mercatto-backend-api`**.
2. En el menú lateral izquierdo, busca la sección **Configuración** y haz clic en:
   👉 **Variables de entorno** *(o **Configuración** según la versión del portal)*.
3. En la pestaña **Configuración de la aplicación**, haz clic en:
   👉 **+ Nueva configuración de la aplicación** (o **+ Agregar**) y añade estas variables una por una:

| Nombre | Valor | Para qué sirve |
| :--- | :--- | :--- |
| **`WEBSITES_PORT`** | `8085` | **Obligatorio:** Le indica a Azure el puerto interno de Spring Boot |
| **`SUPABASE_DB_PASSWORD`** | *(Tu clave de Supabase)* | Conexión con tu base de datos PostgreSQL |
| **`GEMINI_API_KEYS`** | *(Tus llaves de Gemini)* | Llaves separadas por coma para el cambio automático en la feria |
| **`APP_COOKIE_SECURE`** | `true` | Seguridad HTTPS para producción |
| **`SPRING_MAIL_HOST`** | `smtp.gmail.com` | Servidor de correo para confirmación de pedidos |
| **`SPRING_MAIL_PORT`** | `587` | Puerto de correo |
| **`SPRING_MAIL_USERNAME`** | `realmercatto@gmail.com` | Correo del sistema |
| **`SPRING_MAIL_PASSWORD`** | `dkbqehynobdnxuag` | Contraseña de aplicación Gmail |

4. En esa misma pantalla, haz clic en la pestaña superior:
   👉 **Configuración general**
   - Busca **Siempre activado** y cámbialo a: **Activado**.  
     *(Esto evita que el servidor se duerma tras 15 minutos como pasaba en Render).*
   - En **Comando de inicio**, escribe exactamente:
     ```bash
     java -jar /home/site/wwwroot/app.jar
     ```
5. Haz clic arriba en el botón **Guardar** y confirma con **Continuar**.

---

## 🚀 PASO 2: Subir el archivo `app.jar` por FTPS (Fácil desde Windows)

Como el portal bloquea accesos directos por seguridad, la forma más rápida y sin errores es usar el Explorador de Windows:

1. En el menú izquierdo de tu aplicación en Azure, entra a:
   👉 **Centro de implementación**
2. Haz clic en la pestaña:
   👉 **Credenciales de FTPS**
3. Verás tres datos en pantalla:
   - **Punto de conexión de FTPS** (algo como `ftps://waws-prod-...windows.net/site/wwwroot`)
   - **Nombre de usuario**
   - **Contraseña**
4. En tu teclado presiona las teclas: `Windows + E` (abre el Explorador de Archivos de tu PC).
5. En la **barra de direcciones superior** de esa ventana, pega el **Punto de conexión de FTPS** que copiaste y presiona `Enter`.
6. Te saldrá un cuadro pidiéndote usuario y contraseña:
   - Pega el **Nombre de usuario** y la **Contraseña** de Azure.
7. Al ingresar verás la carpeta: entra a **`site`** y luego a **`wwwroot`**.
8. Ahora copia el archivo de tu PC:
   `C:\Users\gjgh2\Downloads\mercatto\mercatto-backend\target\app.jar`
   y **pégalo dentro de `wwwroot`**. (Tardará unos 20-30 segundos en transferirse).

---

## 🔄 PASO 3: Reiniciar y Ver los Registros en Vivo

1. En el menú izquierdo de Azure, haz clic arriba en **Información general**.
2. En la barra superior, haz clic en el botón **Reiniciar** (y confirma con Sí).
3. En el menú izquierdo, baja hasta **Supervisión** y haz clic en:
   👉 **Secuencia de registro**
   - Verás la consola en vivo mostrando el logo de Spring Boot iniciándose y conectándose a Supabase.
4. Cuando termine de arrancar, abre en tu navegador:
   👉 `https://mercatto-backend-api.azurewebsites.net/api/health`
   - Si te responde `{"status":"UP"}` o `{"status":"OK"}` significa que tu backend ya está 100% activo en Azure.

---

## 🌐 PASO 4: Conectar tu Frontend en Vercel

1. Entra a [vercel.com](https://vercel.com) y selecciona tu proyecto de Mercatto.
2. Ve a **Settings** (Configuración) > **Environment Variables** (Variables de entorno).
3. Edita la variable **`VITE_API_URL`**:
   - Cambia el valor anterior por:
     ```text
     https://mercatto-backend-api.azurewebsites.net/api
     ```
4. Guarda los cambios y haz clic en **Redeploy** en tu panel de Vercel.

---

## 🎪 PASO 5: Prueba de Fuego para la Feria

- Tu backend ya tiene activo el servicio **MultiAgenteIaService**.
- Si durante la presentación en la feria se agotan los tokens de una cuenta de Gemini, el backend conmutará de inmediato a la cuenta de respaldo sin que la persona que esté usando el chatbot se dé cuenta ni vea errores.
- Puedes consultar el panel de métricas de agentes en vivo en:
  👉 `https://mercatto-backend-api.azurewebsites.net/api/ia/metricas`
