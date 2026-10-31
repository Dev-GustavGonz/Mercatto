package com.mercatto.modules.ia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercatto.modules.ia.dto.ChatIaResponse;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MultiAgenteIaService {

    private static final Logger log = LoggerFactory.getLogger(MultiAgenteIaService.class);

    private static final String SYSTEM_PROMPT = """
        Eres MercattoBot, el asesor virtual experto, empático y oficial de 'Mercatto', la plataforma de comercio electrónico multitienda en Colombia.

        Tu objetivo es brindar una atención al cliente de primer nivel a compradores, visitantes y emprendedores que desean vender en el marketplace.

        === CONOCIMIENTO PROFUNDO DE MERCATTO ===

        1. 🛒 ¿CÓMO COMPRAR EN MERCATTO?:
           • Los usuarios pueden explorar el catálogo libremente por categorías (Moda, Calzado, Tecnología, Hogar, Belleza).
           • Se puede comprar con una cuenta registrada o como INVITADO (Guest Checkout) indicando únicamente nombre, teléfono, dirección y correo electrónico para la factura y guía.
           • Carrito con cálculo automático de fletes y cupones de descuento.
           • Tras comprar, el cliente recibe confirmación inmediata por correo con la hora oficial de Colombia (UTC-5), el detalle de su pedido y el enlace de seguimiento.

        2. 💳 MÉTODOS DE PAGO Y CUSTODIA SEGURA (ESCROW):
           • Pagos 100% protegidos mediante la pasarela oficial Wompi (Bancolombia).
           • Métodos aceptados:
             - Tarjetas de Crédito y Débito (Visa, Mastercard, American Express).
             - Transferencias bancarias PSE (cualquier banco en Colombia).
             - Billeteras digitales: Nequi y Daviplata con aprobación inmediata.
             - Pago Contra Entrega en efectivo al momento de recibir el paquete.
           • 🔒 Garantía Mercatto Escrow: El dinero de la compra se mantiene en custodia protegida y solo se transfiere a la tienda después de que el producto sea entregado a entera satisfacción del comprador.

        3. 🚚 POLÍTICA DE ENVÍOS Y RASTREO CON EVIDENCIA:
           • ¡ENVÍO GRATIS a nivel nacional en compras superiores a $150.000 COP!
           • Tarifa estándar fija de $12.000 COP para compras inferiores.
           • Envíos rápidos en alianza con Servientrega, Coordinadora e Interrapidísimo (24 a 48 horas en Cartagena y ciudades principales).
           • 📸 Evidencia de Entrega: Para mayor seguridad, el vendedor debe cargar obligatoriamente una fotografía como prueba física de la entrega al marcar el pedido como entregado.
           • Rastreo disponible 24/7 en '/rastreo' ingresando el código de pedido (ej: PED-20261031-XXXX) y el correo del comprador.

        4. 🏪 PLANES Y COMISIONES PARA VENDEDORES (MARKETPLACE):
           • Registro gratuito y apertura de tienda en menos de 2 minutos.
           • Tres planes adaptados a cada etapa del negocio:
             - 🌱 Plan Starter: $0/mes (Gratuito), comisión del 10% por venta concretada. Ideal para iniciar sin riesgo.
             - 🚀 Plan Profesional: $49.000 COP/mes, comisión reducida del 5% por venta.
             - 👑 Plan Elite Premium: $99.000 COP/mes, comisión mínima del 2% por venta, insignia verificada Élite y posicionamiento destacado en el catálogo y búsquedas.
           • Panel de vendedor completo con control de inventario, variantes, gestión de pedidos y analítica predictiva de ventas.

        5. 🏷️ CUPONES DE DESCUENTO VIGENTES:
           • 'BIENVENIDA': $20.000 COP de descuento en compras desde $100.000 COP.
           • 'MERCATTO10': 10% de descuento en compras desde $30.000 COP (ahorro de hasta $50.000 COP).
           • Se ingresan en el campo 'Código de cupón' en el carrito o checkout.

        6. 📞 ATENCIÓN AL CLIENTE HUMANA:
           • Línea oficial de WhatsApp de Soporte: +57 323 388 2717.
           • Correo de atención: realmercatto@gmail.com.
           • Formulario de tickets directo dentro de la plataforma.

        === PAUTAS DE ESTILO Y FORMATO ===
        - Responde siempre en español con tono amable, seguro, profesional y carismático.
        - Estructura las respuestas con viñetas claras, títulos en negrita y emojis acordes.
        - Sé detallado y completo pero fácil de escanear visualmente.
        - Si preguntan por productos concretos, destaca las categorías y recomienda revisar el catálogo en tiempo real.
        """;

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private ObjectMapper objectMapper;

    // Llaves de API para agentes Gemini (soporta múltiples llaves separadas por coma)
    @Value("${gemini.api-keys:${GEMINI_API_KEYS:${GEMINI_API_KEY:}}}")
    private String geminiApiKeysRaw;

    @Value("${gemini.api-key-2:${GEMINI_API_KEY_2:}}")
    private String geminiApiKey2;

    @Value("${gemini.api-key-3:${GEMINI_API_KEY_3:}}")
    private String geminiApiKey3;

    // Proveedor secundario (Groq o OpenAI para redundancia total de tokens en ferias)
    @Value("${groq.api-key:${GROQ_API_KEY:}}")
    private String groqApiKey;

    @Value("${openai.api-key:${OPENAI_API_KEY:}}")
    private String openaiApiKey;

    // Integración opcional con n8n
    @Value("${n8n.webhook-url:${N8N_WEBHOOK_URL:http://localhost:5678/webhook/mercatto-chat}}")
    private String n8nWebhookUrl;

    // Métricas para la presentación en feria
    private final AtomicInteger totalConsultas = new AtomicInteger(0);
    private final AtomicInteger failoversRealizados = new AtomicInteger(0);
    private final Map<String, Integer> consultasPorAgente = new ConcurrentHashMap<>();
    private final Map<String, Long> agentesAgotadosTemporalmente = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public ChatIaResponse procesarMensaje(String mensajeUsuario, String sessionId) {
        if (mensajeUsuario == null || mensajeUsuario.isBlank()) {
            return new ChatIaResponse("¡Hola! ¿En qué puedo ayudarte hoy en Mercatto?", "MercattoBot Local", "Local", false, 0);
        }

        totalConsultas.incrementAndGet();
        String msg = mensajeUsuario.trim();
        List<AgenteConfig> pool = construirPoolAgentes();

        boolean huboTokensAgotados = false;
        int intento = 1;

        for (AgenteConfig agente : pool) {
            // Verificar si el agente está temporalmente marcado como agotado (por 3 minutos)
            Long expiracion = agentesAgotadosTemporalmente.get(agente.nombre());
            if (expiracion != null && System.currentTimeMillis() < expiracion) {
                log.info("Saltando agente [{}] por cuota agotada temporalmente.", agente.nombre());
                huboTokensAgotados = true;
                continue;
            }

            try {
                log.info("Intento #{}: Consultando al agente [{}] (Proveedor: {})...", intento, agente.nombre(), agente.proveedor());
                String respuesta = ejecutarAgente(agente, msg, sessionId);

                if (respuesta != null && !respuesta.isBlank()) {
                    consultasPorAgente.merge(agente.nombre(), 1, Integer::sum);
                    if (huboTokensAgotados) {
                        failoversRealizados.incrementAndGet();
                        log.warn("Failover exitoso hacia [{}] tras agotamiento de tokens previos.", agente.nombre());
                    }
                    return new ChatIaResponse(respuesta, agente.nombre(), agente.proveedor(), huboTokensAgotados, intento);
                }
            } catch (Exception e) {
                String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                // Detección de agotamiento de cuota o rate limit
                boolean esErrorCuota = errorMsg.contains("429") ||
                        errorMsg.contains("quota") ||
                        errorMsg.contains("resource_exhausted") ||
                        errorMsg.contains("tokens") ||
                        errorMsg.contains("rate_limit") ||
                        errorMsg.contains("403");

                if (esErrorCuota) {
                    log.error("¡ALERTA FERIA! El agente [{}] ha agotado sus tokens/cuota. Activando failover...", agente.nombre());
                    huboTokensAgotados = true;
                    // Marcar como agotado por 3 minutos para que las siguientes consultas salten directo al siguiente
                    agentesAgotadosTemporalmente.put(agente.nombre(), System.currentTimeMillis() + (3 * 60 * 1000));
                } else {
                    log.warn("Error en agente [{}] ({}): {}. Pasando al siguiente...", agente.nombre(), agente.proveedor(), e.getMessage());
                }
            }
            intento++;
        }

        // Si todos los agentes externos agotaron sus tokens o falló la red, entra el Agente Local Infalible
        log.warn("Todos los agentes externos agotados o sin red. Ejecutando Agente Experto Mercatto Local...");
        String respuestaFallback = responderConAgenteLocal(msg);
        failoversRealizados.incrementAndGet();
        consultasPorAgente.merge("Agente Experto Mercatto Local", 1, Integer::sum);

        return new ChatIaResponse(
                respuestaFallback,
                "Agente Experto Mercatto Local",
                "Motor Interno Mercatto",
                true,
                intento
        );
    }

    private String ejecutarAgente(AgenteConfig agente, String mensaje, String sessionId) throws Exception {
        return switch (agente.tipo()) {
            case GEMINI -> llamarGemini(agente.apiKey(), agente.modelo(), mensaje);
            case GROQ -> llamarGroq(agente.apiKey(), agente.modelo(), mensaje);
            case OPENAI -> llamarOpenAI(agente.apiKey(), agente.modelo(), mensaje);
            case N8N -> llamarN8nWebhook(agente.endpoint(), mensaje, sessionId);
            case LOCAL -> responderConAgenteLocal(mensaje);
        };
    }

    // ── 1. Integración Gemini API Oficial ───────────────────────────────
    private String llamarGemini(String apiKey, String modelo, String mensaje) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelo, apiKey);

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", mensaje)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 800
                )
        );

        String jsonBody = objectMapper.writeValueAsString(body);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() == 429 || resp.statusCode() == 403) {
            throw new RuntimeException("HTTP " + resp.statusCode() + " RESOURCE_EXHAUSTED / Quota exceeded en Gemini");
        }
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new RuntimeException("Gemini error status " + resp.statusCode() + ": " + resp.body());
        }

        JsonNode root = objectMapper.readTree(resp.body());
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }
        throw new RuntimeException("Respuesta vacía o formato desconocido de Gemini");
    }

    // ── 2. Integración Groq / OpenAI (Compatibilidad OpenAI format) ────
    private String llamarGroq(String apiKey, String modelo, String mensaje) throws Exception {
        return llamarApiOpenAiCompatible("https://api.groq.com/openai/v1/chat/completions", apiKey, modelo, mensaje);
    }

    private String llamarOpenAI(String apiKey, String modelo, String mensaje) throws Exception {
        return llamarApiOpenAiCompatible("https://api.openai.com/v1/chat/completions", apiKey, modelo, mensaje);
    }

    private String llamarApiOpenAiCompatible(String url, String apiKey, String modelo, String mensaje) throws Exception {
        Map<String, Object> body = Map.of(
                "model", modelo,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", mensaje)
                ),
                "temperature", 0.7,
                "max_tokens", 800
        );

        String jsonBody = objectMapper.writeValueAsString(body);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() == 429 || resp.statusCode() == 403) {
            throw new RuntimeException("HTTP " + resp.statusCode() + " Rate limit / Quota exceeded");
        }
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new RuntimeException("Error status " + resp.statusCode() + ": " + resp.body());
        }

        JsonNode root = objectMapper.readTree(resp.body());
        JsonNode choices = root.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            JsonNode content = choices.get(0).path("message").path("content");
            if (!content.isMissingNode()) {
                return content.asText();
            }
        }
        throw new RuntimeException("Respuesta vacía de proveedor OpenAI/Groq");
    }

    // ── 3. Integración con Webhook n8n ─────────────────────────────────
    private String llamarN8nWebhook(String endpoint, String mensaje, String sessionId) throws Exception {
        Map<String, Object> payload = Map.of(
                "message", mensaje,
                "sessionId", sessionId != null ? sessionId : "default-session"
        );

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new RuntimeException("n8n webhook respondió con status " + resp.statusCode());
        }

        JsonNode root = objectMapper.readTree(resp.body());
        if (root.has("reply")) return root.get("reply").asText();
        if (root.has("output")) return root.get("output").asText();
        if (root.has("text")) return root.get("text").asText();
        return root.asText();
    }

    // ── 4. Agente Experto Mercatto Local (Garantía 100% de respuesta) ───
    public String responderConAgenteLocal(String mensaje) {
        String t = mensaje.toLowerCase();

        // 1. Métodos de pago y seguridad
        if (t.contains("pago") || t.contains("tarjeta") || t.contains("nequi") || t.contains("pse") || 
            t.contains("bancolombia") || t.contains("efectivo") || t.contains("daviplata") || t.contains("wompi") || t.contains("segur")) {
            return """
                💳 **Métodos de Pago y Seguridad en Mercatto:**
                
                En Mercatto todas tus compras están 100% protegidas mediante la pasarela certificada **Wompi Bancolombia**:
                
                • 📱 **Billeteras Digitales:** Paga al instante desde tu celular con **Nequi** o **Daviplata** sin costos adicionales.
                • 🏦 **Transferencias Bancarias (PSE):** Débito directo desde cualquier cuenta bancaria en Colombia.
                • 💳 **Tarjetas de Crédito y Débito:** Visa, Mastercard y American Express con opción de cuotas.
                • 💵 **Pago Contra Entrega (Efectivo):** Puedes pagar en efectivo en el momento de recibir tu paquete en tu puerta.
                
                🔒 **Protección de Fondos (Escrow Mercatto):**
                Tu dinero queda bajo custodia segura de Mercatto. El vendedor solo recibe la liquidación de su venta una vez que el pedido haya sido entregado satisfactoriamente con su respectiva evidencia física.
                """;
        }

        // 2. Cómo vender, comisiones y planes
        if (t.contains("vender") || t.contains("abrir tienda") || t.contains("comision") || 
            t.contains("plan") || t.contains("registro vendedor") || t.contains("proveedor") || t.contains("ganar dinero")) {
            return """
                🏪 **¿Cómo Vender y Abrir tu Tienda en Mercatto?**
                
                ¡Empezar a vender tus productos en Mercatto es gratis y toma menos de 2 minutos!
                
                **Pasos para comenzar:**
                1. Haz clic en **'Vender'** o regístrate eligiendo el rol **Vendedor**.
                2. Personaliza tu tienda con tu logo, portada, descripción y enlaces sociales.
                3. Publica tus artículos con fotografías, variantes de talla/color y precios.
                4. Gestiona tus pedidos y clientes desde tu propio panel administrativo.
                
                ✨ **Planes Transparentes para Vendedores:**
                • 🌱 **Plan Starter ($0 COP/mes):** Sin costo fijo mensual, comisión del **10%** por venta concretada. Ideal para probar sin riesgo.
                • 🚀 **Plan Profesional ($49.000 COP/mes):** Comisión del **5%** por venta, perfecto para tiendas en crecimiento.
                • 👑 **Plan Elite Premium ($99.000 COP/mes):** Comisión mínima del **2%**, insignia Élite de verificación y máxima prioridad en las búsquedas.
                
                *El desembolso de tus ventas se realiza de forma automática y transparente a tu cuenta bancaria.*
                """;
        }

        // 3. Envíos, fletes, tiempos de entrega y cobertura
        if (t.contains("envio") || t.contains("flete") || t.contains("costo") || t.contains("cobertura") || 
            t.contains("transportadora") || t.contains("tiempo") || t.contains("demora") || t.contains("cartagena")) {
            return """
                🚚 **Política de Envíos y Tiempos de Entrega:**
                
                En Mercatto conectamos comercios locales con compradores en toda Colombia:
                
                • 🎁 **Envío Gratis:** En todas tus compras iguales o superiores a **$150.000 COP**.
                • 📦 **Tarifa Fija Estándar:** Únicamente **$12.000 COP** para compras menores a nivel nacional.
                • ⏱️ **Tiempos de Entrega Estimados:**
                  - **Cartagena de Indias:** De 24 a 48 horas hábiles.
                  - **Ciudades Principales de Colombia:** De 48 a 72 horas hábiles.
                • 🚚 **Transportadoras Oficiales:** Coordinadora, Servientrega e Interrapidísimo.
                • 📸 **Seguridad en la Entrega:** Todos los despachos exigen la carga de una fotografía de evidencia de entrega por parte del repartidor o vendedor antes de finalizar la orden.
                """;
        }

        // 4. Rastreo de pedidos y seguimiento
        if (t.contains("rastre") || t.contains("seguimiento") || t.contains("donde esta mi pedido") || 
            t.contains("guia") || t.contains("estado") || t.contains("mi orden")) {
            return """
                📍 **Rastreo de Pedidos en Tiempo Real:**
                
                Puedes seguir el recorrido de tu compra las 24 horas del día:
                
                1. Ingresa a la sección **'Rastrear Pedido'** en la barra superior o visita `/rastreo`.
                2. Digita tu **Código de Pedido** (ejemplo: `PED-20261031-1045`) y tu **correo electrónico**.
                3. Verás la línea de tiempo completa: *Pendiente → En Preparación → En Camino → Entregado*.
                4. Una vez entregado, podrás visualizar la **foto de evidencia de entrega** cargada por el vendedor y la hora exacta en zona de Colombia.
                
                *¿No encuentras tu código? Revisa la bandeja de entrada o spam del correo con el que realizaste tu compra.*
                """;
        }

        // 5. Cupones de descuento y promociones
        if (t.contains("cupon") || t.contains("descuento") || t.contains("promo") || 
            t.contains("oferta") || t.contains("codigo") || t.contains("rebaja")) {
            return """
                🏷️ **Cupones de Descuento Activos en Mercatto:**
                
                Aprovecha nuestros códigos promocionales vigentes:
                
                • 🎟️ **BIENVENIDA:**
                  - Descuento directo de **$20.000 COP**.
                  - Válido en compras a partir de $100.000 COP.
                • 🏷️ **MERCATTO10:**
                  - Descuento del **10%** en todo el catálogo seleccionado.
                  - Válido en compras desde $30.000 COP (ahorro máximo de $50.000 COP).
                
                💡 **¿Cómo aplicarlo?:** Escribe el código en el recuadro *'Código de cupón'* en el Carrito o en la pantalla de Checkout y haz clic en *Aplicar*.
                """;
        }

        // 6. Proceso de compra paso a paso
        if (t.contains("como comprar") || t.contains("pasos") || t.contains("comprar") || t.contains("funciona")) {
            return """
                🛒 **Guía Paso a Paso para Comprar en Mercatto:**
                
                1. 🔍 **Explora:** Navega por nuestras tiendas oficiales o usa la barra de búsqueda para encontrar lo que te gusta.
                2. 🛍️ **Agrega al Carrito:** Elige la talla, color o variante deseada y haz clic en *'Agregar al carrito'*.
                3. 👤 **Compra con Cuenta o como Invitado:** No es obligatorio crear contraseña; puedes comprar como invitado indicando tu correo y dirección.
                4. 💳 **Paga Seguro:** Selecciona tu medio de pago favorito (Tarjeta, Nequi, PSE o Pago Contra Entrega en efectivo).
                5. 📧 **Confirmación y Guía:** Recibirás tu recibo oficial en el correo y podrás rastrear el pedido en vivo hasta la puerta de tu casa.
                """;
        }

        // 7. Soporte humano y contacto
        if (t.contains("soporte") || t.contains("ayuda") || t.contains("asesor") || 
            t.contains("humano") || t.contains("telefono") || t.contains("whatsapp") || t.contains("correo")) {
            return """
                🎧 **Canales de Atención al Cliente Mercatto:**
                
                Si necesitas asesoría personalizada con un asesor de nuestro equipo:
                
                • 💬 **WhatsApp Oficial:** [+57 323 388 2717](https://wa.me/573233882717) *(Atención rápida de lunes a sábado)*.
                • 📧 **Correo Electrónico:** `realmercatto@gmail.com`
                • 🎫 **Sistema de Tickets:** Puedes dejar un mensaje detallado a través del formulario de soporte en la plataforma.
                • 📍 **Sede:** Cartagena de Indias, Bolívar, Colombia.
                """;
        }

        // Recomendación dinámica de productos reales desde la base de datos
        try {
            List<Producto> productos = productoRepo.findTop8ByActivoTrueOrderByTotalVentasDesc();
            if (productos != null && !productos.isEmpty()) {
                StringBuilder sb = new StringBuilder("¡Hola! 👋 Soy **MercattoBot**, tu asistente de compras en Mercatto Colombia.\n\n🔥 **Artículos más populares y vendidos hoy:**\n\n");
                for (Producto p : productos) {
                    double precioFinal = p.getPrecioOferta() != null ? p.getPrecioOferta() : p.getPrecio();
                    sb.append(String.format("• **%s** — *$%,.0f COP*", p.getTitulo(), precioFinal));
                    if (p.getMarca() != null && !p.getMarca().isBlank()) {
                        sb.append(String.format(" *(Marca: %s)*", p.getMarca().trim()));
                    }
                    sb.append("\n");
                }
                sb.append("\n💡 *Puedes preguntarme por:* métodos de pago seguros, envíos gratis, cupones de descuento o cómo abrir tu propia tienda.");
                return sb.toString();
            }
        } catch (Exception ignored) {}

        return """
            ¡Hola! 👋 Soy **MercattoBot**, el asistente oficial de Mercatto Colombia.
            
            Estoy listo para ayudarte con lo que necesites:
            • 🛒 **¿Cómo comprar?:** Pasos para comprar de forma fácil y 100% segura.
            • 💳 **Medios de pago:** Tarjetas, Nequi, PSE y Pago Contra Entrega.
            • 🚚 **Envíos y cobertura:** Envío gratis desde $150.000 COP y tiempos de entrega.
            • 🏪 **Vender en Mercatto:** Abre tu tienda con planes desde el 2% de comisión.
            • 📍 **Rastreo de pedido:** Consulta el estado y foto de entrega con tu código.
            • 🏷️ **Cupones:** Usa `BIENVENIDA` o `MERCATTO10` para ahorrar en tu orden.
            
            ¿Sobre cuál de estos temas te gustaría saber más?
            """;
    }

    // ── Construcción Dinámica del Pool de Agentes ──────────────────────
    private List<AgenteConfig> construirPoolAgentes() {
        List<AgenteConfig> pool = new ArrayList<>();

        // Recopilar llaves de Gemini
        Set<String> geminiKeys = new LinkedHashSet<>();
        if (geminiApiKeysRaw != null && !geminiApiKeysRaw.isBlank()) {
            for (String k : geminiApiKeysRaw.split(",")) {
                if (!k.trim().isEmpty()) geminiKeys.add(k.trim().replaceAll("^[\"']|[\"']$", ""));
            }
        }
        if (geminiApiKey2 != null && !geminiApiKey2.isBlank()) geminiKeys.add(geminiApiKey2.trim());
        if (geminiApiKey3 != null && !geminiApiKey3.isBlank()) geminiKeys.add(geminiApiKey3.trim());

        int geminiIdx = 1;
        for (String k : geminiKeys) {
            pool.add(new AgenteConfig("Agente Gemini 2.0 Flash (Llave #" + geminiIdx + ")", TipoAgente.GEMINI, "Google Gemini", "gemini-2.0-flash", k, null));
            pool.add(new AgenteConfig("Agente Gemini 1.5 Flash (Llave #" + geminiIdx + ")", TipoAgente.GEMINI, "Google Gemini", "gemini-1.5-flash", k, null));
            geminiIdx++;
        }

        // Proveedor de respaldo Groq
        if (groqApiKey != null && !groqApiKey.isBlank()) {
            pool.add(new AgenteConfig("Agente Groq Llama 3.3 (Redundancia)", TipoAgente.GROQ, "Groq Cloud", "llama-3.3-70b-versatile", groqApiKey.trim(), null));
        }

        // Proveedor de respaldo OpenAI
        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            pool.add(new AgenteConfig("Agente OpenAI GPT-4o Mini", TipoAgente.OPENAI, "OpenAI", "gpt-4o-mini", openaiApiKey.trim(), null));
        }

        // Agente n8n
        if (n8nWebhookUrl != null && !n8nWebhookUrl.isBlank()) {
            pool.add(new AgenteConfig("Agente Flujo n8n Workflow", TipoAgente.N8N, "n8n Automation", "n8n-langchain", null, n8nWebhookUrl.trim()));
        }

        // Agente Local como último eslabón
        pool.add(new AgenteConfig("Agente Experto Mercatto Local", TipoAgente.LOCAL, "Motor Interno Mercatto", "mercatto-knowledge-engine", null, null));

        return pool;
    }

    public Map<String, Object> obtenerEstadoAgentes() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("totalConsultas", totalConsultas.get());
        status.put("failoversRealizados", failoversRealizados.get());
        status.put("consultasPorAgente", consultasPorAgente);

        List<Map<String, String>> agentesInfo = new ArrayList<>();
        for (AgenteConfig a : construirPoolAgentes()) {
            Long exp = agentesAgotadosTemporalmente.get(a.nombre());
            boolean agotado = exp != null && System.currentTimeMillis() < exp;
            agentesInfo.add(Map.of(
                    "nombre", a.nombre(),
                    "proveedor", a.proveedor(),
                    "tipo", a.tipo().name(),
                    "modelo", a.modelo() != null ? a.modelo() : "N/A",
                    "estado", agotado ? "ENFRIAMIENTO_POR_CUOTA_AGOTADA" : "ACTIVO_Y_DISPONIBLE"
            ));
        }
        status.put("agentesRegistrados", agentesInfo);
        status.put("estadoGeneral", "OPERATIVO_AL_100%");
        return status;
    }

    private enum TipoAgente { GEMINI, GROQ, OPENAI, N8N, LOCAL }
    private record AgenteConfig(String nombre, TipoAgente tipo, String proveedor, String modelo, String apiKey, String endpoint) {}
}
