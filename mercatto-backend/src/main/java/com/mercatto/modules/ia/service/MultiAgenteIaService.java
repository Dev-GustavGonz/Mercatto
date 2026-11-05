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
import java.util.concurrent.ThreadLocalRandom;

@Service
public class MultiAgenteIaService {
    private boolean contieneEspanolProminente(String texto) {
        if (texto == null || texto.isBlank()) return false;
        String t = texto.toLowerCase();
        return t.contains("¡hola") || t.contains("artículos más") || t.contains("articulos mas") ||
               t.contains("¿deseas") || t.contains("con gusto te ayudo") || t.contains("métodos de pago") ||
               t.contains("metodos de pago") || t.contains("cómo comprar") || t.contains("como comprar") ||
               t.contains("en la tienda hoy") || t.contains("soy mercattobot");
    }



    private static final Logger log = LoggerFactory.getLogger(MultiAgenteIaService.class);

    private static final String SYSTEM_PROMPT = """
        Eres MercattoBot, el asesor virtual experto, empático y oficial de 'Mercatto', la plataforma de comercio electrónico multitienda en Colombia.

        Tu objetivo es brindar una atención al cliente de primer nivel a compradores, visitantes y emprendedores que desean vender en el marketplace.

        === CONOCIMIENTO PROFUNDO DE MERCATTO ===

        0. 🌐 ¿QUÉ ES Y CÓMO FUNCIONA MERCATTO?:
           • Mercatto es el marketplace multitienda líder en Colombia que conecta a compradores con tiendas oficiales y emprendedores verificados en un ecosistema ágil y 100% seguro.
           • Para Compradores: Permite buscar y adquirir artículos en múltiples categorías (Moda, Calzado, Tecnología, Hogar, Belleza), comprar con cuenta o como Invitado, pagar con Wompi (Tarjetas, PSE, Nequi) o Contra Entrega en efectivo, con rastreo en tiempo real y dinero 100% protegido bajo custodia Escrow hasta recibir a entera conformidad.
           • Para Vendedores / Emprendedores: Permite crear una tienda virtual en menos de 2 minutos, publicar productos con fotos y variantes, vender con comisiones desde el 2% al 10% (Starter, Profesional o Élite Premium) y controlar inventario y analítica de ventas.
           • Envíos: Cobertura en toda Colombia con Coordinadora, Servientrega e Interrapidísimo, con ¡Envío Gratis desde $150.000 COP!

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

        === REGLA ESTRICTA DE ENFOQUE EXCLUSIVO EN MERCATTO Y DISCULPA ===
        - Tu propósito ÚNICO y EXCLUSIVO es atender consultas sobre Mercatto (productos, compras, envíos, pasarela de pago Wompi Bancolombia, comisiones de tiendas, cupones, rastreo y soporte de la plataforma en Colombia).
        - Si el usuario pregunta sobre CUALQUIER TEMA AJENO A MERCATTO (como tareas académicas, matemáticas, chistes, recetas de cocina, política, deportes generales, clima, religión, programación, otros comercios externos o temas de cultura general):
          1. DEBES comenzar tu respuesta SIEMPRE con una DISCULPA cortés (por ejemplo: "Disculpa, como asistente de Mercatto...", "Disculpa la molestia, mi función...", "Lo siento, disculpa...").
          2. Explica con amabilidad que únicamente estás programado para responder dudas sobre Mercatto, compras, tiendas y envíos en Colombia.
          3. Invita al usuario a consultar sobre productos, pagos o tiendas en nuestra plataforma.
          4. Varía la forma de disculparte y de responder en cada interacción para que tus mensajes no sean repetitivos.

        === PAUTAS DE ESTILO Y FORMATO ===
        - Tono amable, seguro, profesional, conciso y dinámico.
        - NO uses emojis exagerados o ruidosos (evita fuego, manos saludando, caritas o cadenas de emojis).
        - Mantén el diseño y texto sobrio, limpio y moderno usando viñetas simples ('•') y encabezados en negrita.
        - IDIOMA: Si el usuario escribe en inglés, o si la consulta proviene en inglés, responde completamente en inglés pulido y natural. Si es en español, responde en español.
        """;

    private static final String SYSTEM_PROMPT_EN = """
        You are MercattoBot, the official, friendly and expert virtual assistant of 'Mercatto', Colombia's leading multi-vendor marketplace.
        Your goal is to provide top-notch customer support in fluent, natural, polished English.

        === MERCATTO CORE KNOWLEDGE ===

        0. 🌐 WHAT IS MERCATTO & HOW DOES IT WORK?:
           • Mercatto is Colombia's leading multi-vendor marketplace connecting buyers with verified brands and independent sellers in a safe, fast, and transparent ecosystem.
           • For Buyers: Browse products by category or official storefront, check out registered or as a Guest, pay securely via Wompi (Cards, PSE, Nequi) or Cash on Delivery, with 24/7 tracking, delivery photo proof, and full Escrow protection until delivery is verified.
           • For Sellers: Open a digital store in under 2 minutes, list products with variants, and sell nationwide with low commissions (2% to 10%) and full sales analytics.
           • Shipping: Nationwide coverage with insured couriers and FREE SHIPPING on purchases of $150,000 COP or more.

        1. HOW TO BUY ON MERCATTO:
           • Explore the catalog across official categories (Fashion, Footwear, Technology, Home, Beauty, Sports).
           • Buy registered or as a GUEST (Guest Checkout) by entering email, phone, and delivery address.
           • Shopping cart with automatic shipping calculation and discount coupons.
           • Real-time order tracking with delivery photo evidence.

        2. PAYMENT METHODS & ESCROW SECURITY:
           • All payments are 100% secure via Wompi Bancolombia certified gateway.
           • Accepted methods:
             - Credit and Debit Cards (Visa, MasterCard, American Express).
             - Bank Transfers (PSE - any Colombian bank).
             - Digital Wallets (Nequi and Daviplata with instant processing).
             - Cash on Delivery (Pay cash when receiving the package at your door).
           • Mercatto Escrow Guarantee: Funds are kept in safe custody and released only after delivery is verified.

        3. SHIPPING POLICY & TRACKING:
           • FREE SHIPPING nationwide on purchases of $150,000 COP or more.
           • Standard flat rate of $12,000 COP for smaller orders.
           • Fast dispatch via Servientrega, Coordinadora, and Interrapidísimo (24-48 hours in Cartagena and main cities).
           • Real-time parcel tracking 24/7 at '/rastreo' using Order Code and buyer email.

        4. SELLER PLANS & COMMISSIONS:
           • Free store registration in under 2 minutes.
           • Plans:
             - Starter Plan: $0/month (Free), 10% commission per completed sale.
             - Professional Plan: $49,000 COP/month, reduced 5% commission.
             - Elite Premium Plan: $99,000 COP/month, minimal 2% commission, verified Elite badge and top search ranking.

        5. ACTIVE DISCOUNT COUPONS:
           • 'BIENVENIDA': $20,000 COP discount on orders of $100,000 COP or more.
           • 'MERCATTO10': 10% discount on orders from $30,000 COP (save up to $50,000 COP).

        6. CUSTOMER SUPPORT:
           • Official WhatsApp Support: +57 323 388 2717 (Monday to Saturday).
           • Support Email: realmercatto@gmail.com.
           • Online contact tickets on the platform.

        === STRICT MERCATTO SCOPE & APOLOGY RULE ===
        - Your SOLE and EXCLUSIVE purpose is to assist users regarding Mercatto (products, orders, nationwide shipping, Wompi Bancolombia payment security, seller commissions, promo codes, parcel tracking, and platform customer support in Colombia).
        - If the user asks about ANYTHING OUTSIDE MERCATTO (general knowledge, homework, coding, recipes, weather, politics, jokes, external sports, personal advice, or unrelated topics):
          1. You MUST ALWAYS start your response with a polite APOLOGY (e.g., "I apologize, as Mercatto's assistant...", "Sorry, but as Mercatto's shopping assistant...", "I apologize for the inconvenience...").
          2. Politely explain that you only handle Mercatto marketplace services, purchases, stores, payments, and shipping.
          3. Guide the user back to how you can assist them with Mercatto.
          4. Vary your apologies, greetings, and phrasing across responses so they feel fresh, natural, and never repetitive.

        === STYLE & LANGUAGE RULES ===
        - Answer directly, helpfully, professionally, and in a clean minimalist format.
        - DO NOT use excessive, tacky, or distracting emojis. Use clean bullet points ('•') and bold headers.
        - MANDATORY LANGUAGE: You MUST respond 100% in fluent English. NEVER reply in Spanish under any circumstance.
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

    public static boolean esIngles(String mensaje, String idioma) {
        if (idioma != null && idioma.toLowerCase().startsWith("en")) {
            return true;
        }
        if (mensaje == null || mensaje.isBlank()) {
            return false;
        }
        String m = mensaje.toLowerCase().trim();
        return m.matches("(?i).*\\b(how|what|where|when|why|who|which|can|could|would|should|do|does|did|is|are|was|were|will|shall|hello|hi|hey|good\\s+(morning|afternoon|evening)|please|help|buy|buying|purchase|order|orders|shipping|ship|delivery|store|shop|seller|sell|payment|pay|paid|price|cost|discount|coupon|coupons|track|tracking|product|products|item|items|refund|thanks|thank\\s+you|support|recommend|shoes|clothes|laptop|phone|tech|kitchen|furniture)\\b.*");
    }

    public ChatIaResponse procesarMensaje(String mensajeUsuario, String sessionId) {
        return procesarMensaje(mensajeUsuario, sessionId, "es");
    }

    public ChatIaResponse procesarMensaje(String mensajeUsuario, String sessionId, String idioma) {
        boolean isEn = esIngles(mensajeUsuario, idioma);
        String idiomaEfectivo = isEn ? "en" : (idioma != null ? idioma : "es");
        if (mensajeUsuario == null || mensajeUsuario.isBlank()) {
            return new ChatIaResponse(
                    isEn ? "Hello! How can I assist you with Mercatto today?" : "¡Hola! ¿En qué puedo ayudarte hoy en Mercatto?",
                    "MercattoBot Local",
                    "Local",
                    false,
                    0
            );
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
                String respuesta = ejecutarAgente(agente, msg, sessionId, idiomaEfectivo);

                if (respuesta != null && !respuesta.isBlank()) {
                    if (isEn && contieneEspanolProminente(respuesta)) {
                        log.warn("El agente [{}] respondió en español a pesar de solicitar inglés. Aplicando respuesta experta en inglés.", agente.nombre());
                        respuesta = responderConAgenteLocal(msg, "en");
                    }
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
        String respuestaFallback = responderConAgenteLocal(msg, idiomaEfectivo);
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

    private String ejecutarAgente(AgenteConfig agente, String mensaje, String sessionId, String idioma) throws Exception {
        return switch (agente.tipo()) {
            case GEMINI -> llamarGemini(agente.apiKey(), agente.modelo(), mensaje, idioma);
            case GROQ -> llamarGroq(agente.apiKey(), agente.modelo(), mensaje, idioma);
            case OPENAI -> llamarOpenAI(agente.apiKey(), agente.modelo(), mensaje, idioma);
            case N8N -> llamarN8nWebhook(agente.endpoint(), mensaje, sessionId, idioma);
            case LOCAL -> responderConAgenteLocal(mensaje, idioma);
        };
    }

    // ── 1. Integración Gemini API Oficial ───────────────────────────────
    private String llamarGemini(String apiKey, String modelo, String mensaje, String idioma) throws Exception {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelo, apiKey);
        boolean isEn = esIngles(mensaje, idioma);
        String promptEfectivo = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT;

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", promptEfectivo))
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
    private String llamarGroq(String apiKey, String modelo, String mensaje, String idioma) throws Exception {
        return llamarApiOpenAiCompatible("https://api.groq.com/openai/v1/chat/completions", apiKey, modelo, mensaje, idioma);
    }

    private String llamarOpenAI(String apiKey, String modelo, String mensaje, String idioma) throws Exception {
        return llamarApiOpenAiCompatible("https://api.openai.com/v1/chat/completions", apiKey, modelo, mensaje, idioma);
    }

    private String llamarApiOpenAiCompatible(String url, String apiKey, String modelo, String mensaje, String idioma) throws Exception {
        boolean isEn = esIngles(mensaje, idioma);
        String promptEfectivo = isEn ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT;

        Map<String, Object> body = Map.of(
                "model", modelo,
                "messages", List.of(
                        Map.of("role", "system", "content", promptEfectivo),
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
    private String llamarN8nWebhook(String endpoint, String mensaje, String sessionId, String idioma) throws Exception {
        boolean isEn = esIngles(mensaje, idioma);
        Map<String, Object> payload = Map.of(
                "message", mensaje,
                "sessionId", sessionId != null ? sessionId : "default-session",
                "idioma", isEn ? "en" : (idioma != null ? idioma : "es")
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
        return responderConAgenteLocal(mensaje, "es");
    }

    private boolean esSaludo(String t) {
        if (t == null) return false;
        String s = t.trim();
        return s.matches("^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches|hey|hi|hello|saludos|que tal|como estas|holi|alo).*");
    }

    private String obtenerSaludoAleatorio(boolean isEn) {
        String[] saludosEs = {
            "¡Hola! Qué gusto saludarte. Soy **MercattoBot**, tu asesor oficial de compras y tiendas en Colombia. ¿En qué te puedo colaborar hoy?",
            "¡Hola! Bienvenido a **Mercatto**. Estoy aquí para orientarte sobre compras seguras, métodos de pago, envíos nacionales o cómo abrir tu propia tienda. ¿Qué te gustaría saber?",
            "¡Hola! ¿Cómo estás? Te puedo guiar paso a paso con productos, cupones de descuento vigentes, seguimiento de pedidos o información para vendedores. ¿En qué te colaboro hoy?",
            "¡Hola! Encantado de atenderte. Dime qué producto buscas o sobre qué proceso de Mercatto necesitas información y con gusto te asesoraré."
        };
        String[] saludosEn = {
            "Hello! Great to have you here. I am **MercattoBot**, your official shopping and seller assistant for Mercatto Colombia. How can I assist you today?",
            "Welcome to **Mercatto**! I am ready to help you with orders, certified payment methods, nationwide delivery, or opening your own store. What would you like to know?",
            "Hi there! How can I assist you today? I can guide you through our product catalog, active discount coupons, parcel tracking, or customer support.",
            "Hello! Nice to meet you. Tell me what you are looking for on Mercatto Colombia and I will gladly guide you."
        };
        String[] pool = isEn ? saludosEn : saludosEs;
        return pool[ThreadLocalRandom.current().nextInt(pool.length)];
    }

    private String obtenerDisculpaFueraDeTema(boolean isEn) {
        String[] disculpasEs = {
            "Disculpa, como asistente virtual de Mercatto solo puedo responder consultas sobre nuestra plataforma, catálogo de productos, tiendas oficiales, compras, métodos de pago y envíos en Colombia. ¿Hay algo de Mercatto en lo que te pueda colaborar hoy?",
            "Disculpa la molestia. Mi especialidad se enfoca exclusivamente en compras, pedidos, tiendas oficiales, comisiones de vendedores y envíos dentro de Mercatto. No dispongo de información sobre otros temas ajenos, pero con gusto te ayudo a buscar productos o conocer cómo vender con nosotros.",
            "Disculpa, esa consulta está fuera de los temas y servicios de Mercatto. Estoy capacitado para ayudarte a comprar seguro, aplicar cupones de descuento, rastrear tus paquetes o abrir tu propia tienda. ¿En qué puedo orientarte de nuestra plataforma?",
            "Lo siento, disculpa. Como bot de atención oficial de Mercatto Colombia, únicamente respondo dudas sobre compras, garantías, pagos y tiendas en nuestra plataforma. ¿Deseas consultar sobre alguno de estos temas?"
        };
        String[] disculpasEn = {
            "I apologize, as Mercatto's virtual assistant I can only help with questions regarding our marketplace, products, official stores, shipping, and payments in Colombia. Can I assist you with an order or store inquiry today?",
            "Sorry about that! My expertise is strictly focused on Mercatto purchases, orders, seller plans, and shipping. I am unable to answer outside topics, but I would be glad to help you explore our catalog or track a package.",
            "I apologize for the inconvenience, but I am only trained to assist with Mercatto-related topics such as orders, coupons, payment methods, and store management. How can I help you regarding our marketplace?",
            "Sorry, that inquiry is outside the scope of Mercatto. I am here to help you shop safely, track deliveries, or launch your store in Colombia. What would you like to know about Mercatto?"
        };
        String[] pool = isEn ? disculpasEn : disculpasEs;
        return pool[ThreadLocalRandom.current().nextInt(pool.length)];
    }

    private String obtenerRespuestaPagos(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Payment Methods and Security in Mercatto:**
                
                All purchases in Mercatto are 100% protected through the certified **Wompi Bancolombia** gateway:
                
                • **Digital Wallets:** Pay instantly from your phone via **Nequi** or **Daviplata**.
                • **Bank Transfers (PSE):** Direct debit from any bank account in Colombia.
                • **Credit and Debit Cards:** Visa, Mastercard, and American Express with installment options.
                • **Cash on Delivery:** Pay in cash directly when the courier arrives at your door.
                
                **Mercatto Escrow Guarantee:**
                Your payment remains safely in escrow. The seller only receives payout once your order has been successfully delivered with physical delivery proof.
                """,
                """
                **How to Pay Securely on Mercatto:**
                
                We provide maximum security for all transactions in Colombia:
                • **Wompi Bancolombia:** Certified digital checkout accepting all Colombian debit/credit cards, PSE, and Nequi.
                • **Cash on Delivery Option:** Pay in cash upon physical receipt of your package at your address.
                • **Funds Escrow Protection:** Money is held securely by Mercatto and never released until your parcel is delivered in perfect condition.
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Métodos de Pago y Seguridad en Mercatto:**
            
            En Mercatto todas tus compras están 100% protegidas mediante la pasarela certificada **Wompi Bancolombia**:
            
            • **Billeteras Digitales:** Paga al instante desde tu celular con **Nequi** o **Daviplata** sin costos adicionales.
            • **Transferencias Bancarias (PSE):** Débito directo desde cualquier cuenta bancaria en Colombia.
            • **Tarjetas de Crédito y Débito:** Visa, Mastercard y American Express con opción de cuotas.
            • **Pago Contra Entrega (Efectivo):** Puedes pagar en efectivo en el momento de recibir tu paquete en tu puerta.
            
            **Protección de Fondos (Escrow Mercatto):**
            Tu dinero queda bajo custodia segura de Mercatto. El vendedor solo recibe la liquidación de su venta una vez que el pedido haya sido entregado satisfactoriamente con su respectiva evidencia física.
            """,
            """
            **Opciones de Pago Disponibles en Mercatto:**
            
            Comprar en Mercatto es totalmente confiable y respaldado:
            • **Pasarela Oficial Wompi:** Paga con tarjetas Visa, Mastercard o mediante PSE y Nequi en segundos.
            • **Pago en Efectivo Contra Entrega:** Si prefieres, abona el valor directamente al repartidor cuando recibas tu pedido.
            • **Custodia Mercatto:** No liberamos los fondos al vendedor hasta verificar que tu paquete llegó completo y conforme.
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaVender(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **How to Sell & Open Your Store on Mercatto:**
                
                Starting to sell on Mercatto is free and takes under 2 minutes:
                
                **Steps to get started:**
                • 1. Click **'Sell'** or register choosing the **Seller** role.
                • 2. Customize your store with your logo, banner, and brand description.
                • 3. Publish your items with photos, colors/sizes, stock, and prices.
                • 4. Manage your orders and customers from your seller dashboard.
                
                **Transparent Seller Plans:**
                • **Starter Plan ($0 COP/month):** No monthly fee, **10%** commission per completed sale. Ideal to start risk-free.
                • **Professional Plan ($49,000 COP/month):** **5%** commission per sale, great for growing stores.
                • **Elite Premium Plan ($99,000 COP/month):** Minimal **2%** commission, verified Elite badge, and top search priority.
                
                *Payouts are transferred directly to your Colombian bank account.*
                """,
                """
                **Seller Plans and Commissions on Mercatto:**
                
                Sell your products to thousands of shoppers across Colombia:
                • **Starter ($0/mo):** 10% commission. Zero fixed costs.
                • **Professional ($49,000 COP/mo):** 5% commission. Advanced analytics.
                • **Elite ($99,000 COP/mo):** Lowest 2% commission, verified badge and top featured placements.
                
                You can register your vendor account at `/registro` in just a few clicks!
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **¿Cómo Vender y Abrir tu Tienda en Mercatto?**
            
            ¡Empezar a vender tus productos en Mercatto es gratis y toma menos de 2 minutos!
            
            **Pasos para comenzar:**
            • 1. Haz clic en **'Vender'** o regístrate eligiendo el rol **Vendedor**.
            • 2. Personaliza tu tienda con tu logo, portada, descripción y enlaces.
            • 3. Publica tus artículos con fotografías, variantes de talla/color y precios.
            • 4. Gestiona tus pedidos y clientes desde tu propio panel administrativo.
            
            **Planes Transparentes para Vendedores:**
            • **Plan Starter ($0 COP/mes):** Sin costo fijo mensual, comisión del **10%** por venta concretada. Ideal para probar sin riesgo.
            • **Plan Profesional ($49.000 COP/mes):** Comisión del **5%** por venta, perfecto para tiendas en crecimiento.
            • **Plan Elite Premium ($99.000 COP/mes):** Comisión mínima del **2%**, insignia Élite de verificación y máxima prioridad en las búsquedas.
            
            *El desembolso de tus ventas se realiza de forma automática a tu cuenta bancaria.*
            """,
            """
            **Planes y Comisiones para Emprendedores en Mercatto:**
            
            Abre tu vitrina digital y vende a clientes de todo el país:
            • **Starter (Gratis):** 10% de comisión por venta, sin mensualidad.
            • **Profesional ($49.000 COP/mes):** 5% de comisión, métricas y control de stock.
            • **Elite ($99.000 COP/mes):** 2% de comisión mínima, sello verificado y máxima exposición en el catálogo.
            
            *Crea tu cuenta de vendedor en segundos desde el botón de Registro.*
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaEnvios(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Shipping Policy & Delivery Times:**
                
                Mercatto connects verified local businesses with buyers across Colombia:
                
                • **Free Shipping:** On all purchases of **$150,000 COP** or more.
                • **Standard Flat Fee:** Only **$12,000 COP** for smaller orders nationwide.
                • **Estimated Delivery Times:**
                  - **Cartagena de Indias:** 24 to 48 business hours.
                  - **Major Cities in Colombia:** 48 to 72 business hours.
                • **Courier Partners:** Insured shipping with Coordinadora, Servientrega, and Interrapidísimo.
                • **Delivery Proof:** Couriers take a mandatory physical photo upon delivery for your peace of mind.
                """,
                """
                **Deliveries and Coverage in Colombia:**
                
                • **Free Shipping Threshold:** Automatic free shipping when your cart reaches $150,000 COP.
                • **Fixed Low Shipping:** $12,000 COP flat fee for orders under the threshold.
                • **National Coverage:** Direct shipments via Servientrega, Coordinadora, and Interrapidísimo with live tracking code.
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Política de Envíos y Tiempos de Entrega en Mercatto:**
            
            • **Envío Gratis:** En todas tus compras iguales o superiores a **$150.000 COP** a nivel nacional.
            • **Tarifa Fija Estándar:** Únicamente **$12.000 COP** para compras menores.
            • **Tiempos de Entrega:**
              - **Cartagena de Indias:** 24 a 48 horas hábiles.
              - **Ciudades Principales:** 48 a 72 horas hábiles.
            • **Empresas Aliadas:** Despachos asegurados a través de Coordinadora, Servientrega e Interrapidísimo.
            • **Foto de Evidencia:** El repartidor captura una fotografía obligatoria al momento de la entrega en tu puerta.
            """,
            """
            **Información de Fletes y Cobertura Nacional:**
            
            • **¡Aprovecha Envío Gratis!** Por compras desde $150.000 COP el flete corre por cuenta de la tienda.
            • **Tarifa Nacional Fija:** Solo $12.000 COP para pedidos inferiores.
            • **Seguimiento Seguro:** Recibes número de guía y confirmación por correo para rastrear el trayecto hasta tu casa.
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaRastreo(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Real-Time Order Tracking:**
                
                Track your package status 24/7:
                • 1. Go to **'Track Order'** in the navigation bar or visit `/rastreo`.
                • 2. Enter your **Order Code** (e.g. `PED-20261031-1045`) and your **email address**.
                • 3. You will see the complete timeline: *Pending → In Preparation → In Transit → Delivered*.
                • 4. Once delivered, you can view the physical delivery photo proof uploaded by the courier.
                """,
                """
                **How to Track Your Purchases on Mercatto:**
                
                • **Registered Users:** Open **'My Orders'** from your profile icon to view details, invoices, and delivery photos.
                • **Guest Purchases:** Visit `/rastreo`, enter your order code and email to inspect the live shipping status instantly.
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Rastreo de Pedidos en Tiempo Real:**
            
            Puedes seguir el recorrido de tu compra las 24 horas del día:
            • 1. Ingresa a la sección **'Rastrear Pedido'** en la barra superior o visita `/rastreo`.
            • 2. Digita tu **Código de Pedido** (ejemplo: `PED-20261031-1045`) y tu **correo electrónico**.
            • 3. Verás la línea de tiempo completa: *Pendiente → En Preparación → En Camino → Entregado*.
            • 4. Una vez entregado, podrás visualizar la **foto de evidencia de entrega** cargada por el vendedor o repartidor.
            """,
            """
            **Consulta el Estado de tu Paquete:**
            
            • **Con Cuenta:** Ingresa a **Mis Pedidos** desde el icono de usuario para ver historial, facturas y fotos de entrega.
            • **Como Invitado:** Ingresa a `/rastreo` con tu código de pedido y correo para conocer la ubicación de tu envío al instante.
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaCupones(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Active Discount Coupons on Mercatto:**
                
                Take advantage of our current promo codes:
                • **BIENVENIDA:** Direct discount of **$20,000 COP** on orders of $100,000 COP or more.
                • **MERCATTO10:** **10% discount** across selected catalog items (orders from $30,000 COP, max discount $50,000 COP).
                
                **How to apply:** Enter the code in the *'Coupon code'* field in the Cart drawer or at Checkout and click *Apply*.
                """,
                """
                **Current Mercatto Promo Codes:**
                
                • Code `BIENVENIDA`: Save **$20,000 COP** on purchases starting from $100,000 COP.
                • Code `MERCATTO10`: Get **10% OFF** on eligible catalog items.
                
                Paste either coupon in your shopping cart before clicking 'Checkout' to enjoy instant savings!
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Cupones de Descuento Activos en Mercatto:**
            
            Aprovecha nuestros códigos promocionales vigentes:
            • **BIENVENIDA:** Descuento directo de **$20.000 COP** en compras a partir de $100.000 COP.
            • **MERCATTO10:** Descuento del **10%** en todo el catálogo seleccionado (válido desde $30.000 COP, ahorro máximo de $50.000 COP).
            
            **¿Cómo aplicarlo?:** Escribe el código en el recuadro *'Código de cupón'* en el Carrito o en el Checkout y haz clic en *Aplicar*.
            """,
            """
            **Descuentos y Promociones Disponibles:**
            
            • Cupón `BIENVENIDA`: Te descuenta **$20.000 COP** directos en compras de $100.000 COP en adelante.
            • Cupón `MERCATTO10`: Te otorga un **10% de rebaja** en compras desde $30.000 COP.
            
            ¡Ingrésalos en tu carrito de compras antes de pagar para aplicar el beneficio de inmediato!
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaComoComprar(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Step-by-Step Guide to Buying on Mercatto:**
                
                • 1. **Browse:** Explore our official stores or use the search bar to find what you need.
                • 2. **Add to Cart:** Select your preferred variant (color, size) and click *'Add to cart'*.
                • 3. **Checkout with Account or as Guest:** No password required; guest checkout is available with just your name, email, and address.
                • 4. **Pay Securely:** Choose your preferred payment method (Card, Nequi, PSE, or Cash on Delivery).
                • 5. **Confirmation & Tracking:** You will receive your official receipt by email with a real-time tracking link.
                """,
                """
                **How to Place an Order on Mercatto:**
                
                • Find your desired items in the catalog.
                • Add them to your shopping cart.
                • You can checkout with a registered account or directly as a guest.
                • Choose your payment method via Wompi Bancolombia or cash upon delivery.
                • Your receipt and tracking code will arrive immediately in your email!
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Guía Paso a Paso para Comprar en Mercatto:**
            
            • 1. **Explora:** Navega por nuestras tiendas oficiales o usa la barra de búsqueda para encontrar lo que te gusta.
            • 2. **Agrega al Carrito:** Elige la talla, color o variante deseada y haz clic en *'Agregar al carrito'*.
            • 3. **Compra con Cuenta o como Invitado:** Puedes comprar como invitado indicando únicamente tu correo y dirección.
            • 4. **Paga Seguro:** Selecciona tu medio de pago favorito (Tarjeta, Nequi, PSE o Pago Contra Entrega en efectivo).
            • 5. **Confirmación y Guía:** Recibirás tu recibo oficial en el correo y podrás rastrear el pedido en vivo hasta tu puerta.
            """,
            """
            **¿Cómo hacer tu pedido en Mercatto?:**
            
            • Elige tus artículos en el catálogo y añádelos al carrito.
            • Ve al carrito y presiona 'Proceder al Pago'.
            • Ingresa tus datos de envío (no requieres contraseña si compras como invitado).
            • Paga con Wompi Bancolombia (Tarjetas, PSE, Nequi) o Contra Entrega.
            • ¡Listo! Tu compra queda protegida bajo garantía Mercatto.
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaSoporte(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **Mercatto Customer Support Channels:**
                
                If you need personalized assistance from our team:
                • **Official WhatsApp:** [+57 323 388 2717](https://wa.me/573233882717) *(Monday to Saturday)*.
                • **Email:** `realmercatto@gmail.com`
                • **Ticket System:** Submit a detailed message using the support form in the platform.
                • **Location:** Cartagena de Indias, Bolívar, Colombia.
                """,
                """
                **Contact Our Support Team:**
                
                Our customer care team is available to assist you:
                • WhatsApp Support: [+57 323 388 2717](https://wa.me/573233882717).
                • Email: `realmercatto@gmail.com`.
                • You can also submit an inquiry through our Help Center form.
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)];
        }
        String[] v = {
            """
            **Canales de Atención al Cliente Mercatto:**
            
            Si necesitas asesoría personalizada con un asesor de nuestro equipo:
            • **WhatsApp Oficial:** [+57 323 388 2717](https://wa.me/573233882717) *(Atención de lunes a sábado)*.
            • **Correo Electrónico:** `realmercatto@gmail.com`
            • **Sistema de Tickets:** Puedes dejar un mensaje detallado a través del formulario de soporte en la plataforma.
            • **Sede:** Cartagena de Indias, Bolívar, Colombia.
            """,
            """
            **Atención Personalizada y Soporte:**
            
            Estamos listos para ayudarte:
            • Escríbenos a nuestro WhatsApp oficial: [+57 323 388 2717](https://wa.me/573233882717).
            • Envíanos un correo a: `realmercatto@gmail.com`.
            • O radica un ticket directo desde la opción 'Centro de Soporte' en la web.
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)];
    }

    private String obtenerRespuestaComoFunciona(boolean isEn) {
        if (isEn) {
            String[] v = {
                """
                **How does Mercatto work? — Colombia's Multi-Vendor Marketplace:**

                Mercatto brings together buyers and verified sellers across Colombia in a trusted shopping ecosystem:

                • **For Shoppers:**
                  1. **Browse Categories:** Explore thousands of products across Fashion, Technology, Home, Footwear, and Beauty.
                  2. **Guest or Account Checkout:** Shop seamlessly with your user profile or simply as a **Guest** without requiring a password.
                  3. **100% Secure Payments:** Certified payment processing through Wompi Bancolombia (Credit/Debit cards, PSE, Nequi) or **Cash on Delivery** at your door.
                  4. **Mercatto Escrow Guarantee:** Your funds are safely held in custody and only released to the seller once your order is confirmed delivered.
                  5. **Nationwide Delivery:** Free shipping on orders over $150,000 COP, real-time tracking, and physical delivery photo proof.

                • **For Sellers & Brands:**
                  1. **Open Your Store in 2 Minutes:** Quick registration, customized storefront, and simple product listing.
                  2. **Transparent Commission:** Flexible plans starting at just 2% commission per sale (Starter, Professional, Elite Premium).
                  3. **Powerful Dashboard:** Live inventory management, sales analytics, and integrated dispatching.

                *Would you like assistance with how to buy, payment methods, opening a store, or tracking an order?*
                """,
                """
                **Mercatto in a nutshell:**

                We are Colombia's premier e-commerce marketplace connecting verified independent stores and shoppers nationwide:

                • **Protected Shopping:** Pay securely via PSE, Nequi, credit cards, or cash upon delivery. Funds are held in escrow until you receive your items.
                • **Reliable Shipping:** Fast dispatch across Colombia with delivery photo evidence and 24/7 tracking.
                • **Empowering Entrepreneurs:** Businesses can easily launch an official storefront and sell nationwide with competitive commission rates.

                How may I help you today? Would you like to explore products, learn about payment options, or register as a seller?
                """
            };
            return v[ThreadLocalRandom.current().nextInt(v.length)].trim();
        }

        String[] v = {
            """
            **¿Cómo funciona Mercatto? — Tu Marketplace Multitienda en Colombia:**

            Mercatto conecta a compradores de todo el país con tiendas oficiales y emprendedores verificados en un entorno seguro y transparente:

            • **Para Compradores:**
              1. **Explora el Catálogo:** Descubre miles de productos en Tecnología, Moda, Calzado, Hogar y Belleza.
              2. **Compra Fácil y Rápido:** Puedes registrarte o comprar como **Invitado** indicando solo tu correo, teléfono y dirección.
              3. **Pagos 100% Seguros:** Mediante pasarela certificada Wompi Bancolombia (Tarjetas, PSE, Nequi, Daviplata) o **Pago Contra Entrega** en efectivo al recibir en tu puerta.
              4. **Garantía Mercatto Escrow:** Tu dinero está en custodia protegida y solo se entrega a la tienda cuando recibes tu pedido a entera satisfacción.
              5. **Envíos y Rastreo en Vivo:** Cobertura en toda Colombia (¡gratis desde $150.000 COP!), seguimiento 24/7 y foto física como prueba de entrega.

            • **Para Vendedores y Marcas:**
              1. **Abre tu Tienda en 2 Minutos:** Regístrate gratis como vendedor, sube tu logo y publica tus artículos con tallas y variantes.
              2. **Comisiones Bajas:** Desde el 2% por venta según tu plan (Starter gratuito al 10%, Profesional al 5% o Élite Premium al 2%).
              3. **Control Total:** Panel administrativo con control de stock, gestión de órdenes y analítica predictiva de ventas.

            *¿Deseas conocer más detalles sobre cómo comprar, medios de pago, cómo abrir tu propia tienda o rastrear una compra?*
            """,
            """
            **Mercatto en pocas palabras:**

            Somos la plataforma de comercio electrónico multitienda que reúne las mejores marcas y emprendimientos de Colombia en un solo lugar:

            • **Compras Protegidas:** Pagas con PSE, Nequi, tarjetas o en efectivo al recibir. Tu pago permanece custodiado por nuestro sistema Escrow hasta que el transportista te entrega el paquete con foto de evidencia.
            • **Logística Confiable:** Despachos a nivel nacional con Servientrega, Coordinadora e Interrapidísimo, con tarifa estándar de $12.000 COP y **Envío Gratis** desde $150.000 COP.
            • **Oportunidad para Vendedores:** Cualquier emprendedor o empresa puede abrir su tienda virtual y vender a todo el país con las comisiones más accesibles del mercado.

            ¿Te gustaría que te ayude con información de compras, métodos de pago o apertura de tu tienda?
            """
        };
        return v[ThreadLocalRandom.current().nextInt(v.length)].trim();
    }

    public String responderConAgenteLocal(String mensaje, String idioma) {
        String t = mensaje != null ? mensaje.toLowerCase() : "";
        boolean isEn = esIngles(mensaje, idioma);

        // 0. ¿Cómo funciona Mercatto o de qué trata la plataforma?
        if (t.contains("como funciona") || t.contains("cómo funciona") || t.contains("que es mercatto") || 
            t.contains("cómo opera") || t.contains("como opera") || t.contains("de que trata") || 
            t.contains("que hace mercatto") || t.contains("acerca de mercatto") ||
            t.contains("how it works") || t.contains("what is mercatto") || t.contains("how does mercatto work") ||
            (t.contains("funciona") && (t.contains("mercatto") || t.contains("plataforma") || t.contains("pagina") || t.contains("marketplace") || t.contains("app")))) {
            return obtenerRespuestaComoFunciona(isEn);
        }

        // 1. Saludo simple
        if (esSaludo(t)) {
            return obtenerSaludoAleatorio(isEn);
        }

        // 2. Métodos de pago y seguridad
        if (t.contains("pago") || t.contains("tarjeta") || t.contains("nequi") || t.contains("pse") || 
            t.contains("bancolombia") || t.contains("efectivo") || t.contains("daviplata") || t.contains("wompi") || t.contains("segur") ||
            t.contains("pay") || t.contains("card") || t.contains("cash") || t.contains("method") || t.contains("accept") || t.contains("wallet")) {
            return obtenerRespuestaPagos(isEn);
        }

        // 3. Cómo vender, comisiones y planes
        if (t.contains("vender") || t.contains("abrir tienda") || t.contains("comision") || 
            t.contains("plan") || t.contains("registro vendedor") || t.contains("proveedor") || t.contains("ganar dinero") ||
            t.contains("sell") || t.contains("store") || t.contains("fee")) {
            return obtenerRespuestaVender(isEn);
        }

        // 4. Envíos, fletes, tiempos de entrega y cobertura
        if (t.contains("envio") || t.contains("flete") || t.contains("costo") || t.contains("cobertura") || 
            t.contains("transportadora") || t.contains("tiempo") || t.contains("demora") || t.contains("cartagena") ||
            t.contains("ship") || t.contains("delivery") || t.contains("freight")) {
            return obtenerRespuestaEnvios(isEn);
        }

        // 5. Rastreo y estado de pedidos
        if (t.contains("rastre") || t.contains("seguimiento") || t.contains("donde esta") || t.contains("guia") || 
            t.contains("mi pedido") || t.contains("estado") || t.contains("paquete") ||
            t.contains("track") || t.contains("where is") || t.contains("status")) {
            return obtenerRespuestaRastreo(isEn);
        }

        // 6. Cupones de descuento y promociones
        if (t.contains("cupon") || t.contains("descuento") || t.contains("promo") || 
            t.contains("oferta") || t.contains("codigo") || t.contains("rebaja") ||
            t.contains("coupon") || t.contains("discount")) {
            return obtenerRespuestaCupones(isEn);
        }

        // 7. Proceso de compra paso a paso
        if (t.contains("como comprar") || t.contains("pasos") || t.contains("comprar") || t.contains("funciona") ||
            t.contains("how to buy") || t.contains("purchase") || t.contains("order")) {
            return obtenerRespuestaComoComprar(isEn);
        }

        // 8. Soporte humano y contacto
        if (t.contains("soporte") || t.contains("ayuda") || t.contains("asesor") || 
            t.contains("humano") || t.contains("telefono") || t.contains("whatsapp") || t.contains("correo") ||
            t.contains("support") || t.contains("agent") || t.contains("human")) {
            return obtenerRespuestaSoporte(isEn);
        }

        // 9. Recomendación de productos si pregunta explícitamente por catálogo o artículos
        if ((t.contains("producto") || t.contains("articulo") || t.contains("catalogo") || t.contains("item") || 
            t.contains("recomienda") || t.contains("que venden") || t.contains("precios") || t.contains("product"))
            && !t.contains("como") && !t.contains("funciona") && !t.contains("que es")) {
            try {
                List<Producto> productos = productoRepo.findTop8ByActivoTrueOrderByTotalVentasDesc();
                if (productos != null && !productos.isEmpty()) {
                    StringBuilder sb = new StringBuilder(isEn
                            ? "**Top featured and best-selling items in the store today:**\n\n"
                            : "**Artículos más destacados y populares en la tienda hoy:**\n\n");
                    for (Producto p : productos) {
                        double precioFinal = p.getPrecioOferta() != null ? p.getPrecioOferta() : p.getPrecio();
                        sb.append(String.format("• **%s** — *$%,.0f COP*", p.getTitulo(), precioFinal));
                        if (p.getMarca() != null && !p.getMarca().isBlank()) {
                            sb.append(String.format(" *(%s: %s)*", isEn ? "Brand" : "Marca", p.getMarca().trim()));
                        }
                        sb.append("\n");
                    }
                    sb.append(isEn
                            ? "\n*You can ask me about:* payment methods, free shipping, discount coupons, or opening your own store."
                            : "\n*Puedes preguntarme por:* métodos de pago seguros, envíos gratis, cupones de descuento o cómo abrir tu propia tienda.");
                    return sb.toString();
                }
            } catch (Exception ignored) {}
        }

        // 10. Consulta fuera del tema de Mercatto: Disculpa cortés obligatoria con variación
        return obtenerDisculpaFueraDeTema(isEn);
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
