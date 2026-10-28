package com.mercatto.modules.soporte.service;

import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.soporte.model.TicketSoporte;
import com.mercatto.modules.usuario.model.Direccion;
import com.mercatto.modules.vendedor.model.Vendedor;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final Locale COLOMBIA_LOCALE = Locale.of("es", "CO");
    private static final DateTimeFormatter FECHA_FORMATTER = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy, hh:mm a", COLOMBIA_LOCALE);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:realmercatto@gmail.com}")
    private String remitente;

    @Value("${email.resend.api-key:}")
    private String resendApiKey;

    @Value("${email.resend.from:Mercatto <onboarding@resend.dev>}")
    private String resendFrom;

    @Value("${email.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${email.brevo.from:realmercatto@gmail.com}")
    private String brevoFrom;

    private String getRemitenteSeguro() {
        if (remitente != null && !remitente.isBlank() && !remitente.contains("TU_CORREO")) {
            return remitente.trim();
        }
        return "realmercatto@gmail.com";
    }

    // ── Texto plano / Notificaciones generales ─────────────────────
    @Async
    public void enviarNotificacion(String destinatario, String asunto, String cuerpo) {
        String cuerpoEscapado = escaparHtml(cuerpo != null ? cuerpo : "").replace("\n", "<br/>");
        String html = """
            <div style="font-family:sans-serif;padding:16px;color:#1e293b;line-height:1.6;">
              <h3 style="color:#7c3aed;margin-top:0;">%s</h3>
              <p>%s</p>
            </div>
            """.formatted(escaparHtml(asunto != null ? asunto : "Notificación"), cuerpoEscapado);
        enviarHtml(destinatario, asunto, html);
    }

    // ── Envío genérico HTML (con soporte para HTTPS API y SMTP) ───
    @Async
    public void enviarHtml(String destinatario, String asunto, String html) {
        if (destinatario == null || destinatario.isBlank()) {
            log.warn("Se omitió envío de correo porque el destinatario está vacío.");
            return;
        }

        // 1. Prioridad: Resend API si está configurado (HTTPS puerto 443 - infalible en Render)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            if (enviarPorResend(destinatario.trim(), asunto, html)) {
                return;
            }
        }

        // 2. Prioridad: Brevo API si está configurado (HTTPS puerto 443)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            if (enviarPorBrevo(destinatario.trim(), asunto, html)) {
                return;
            }
        }

        // 3. Envío SMTP estándar (JavaMail)
        if (mailSender == null) {
            log.warn("Correo no configurado (mailSender=null). Se omite envío a {} — asunto: {}", destinatario, asunto);
            return;
        }

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
            helper.setTo(destinatario.trim());
            helper.setSubject(asunto);
            helper.setText(html, true);
            helper.setFrom(getRemitenteSeguro(), "Mercatto");

            mailSender.send(mensaje);
            log.info("Correo HTML enviado exitosamente por SMTP a: {} | Asunto: {}", destinatario, asunto);
        } catch (Exception e) {
            log.error("Fallo al enviar correo HTML a {} por SMTP ({}:{}): {}", destinatario, mailHost, mailPort, e.getMessage(), e);
            String msg = (e.getMessage() != null) ? e.getMessage().toLowerCase() : "";
            if (msg.contains("timed out") || msg.contains("connection refused") || msg.contains("could not connect")) {
                log.error("DIAGNÓSTICO CRÍTICO: La conexión al servidor SMTP ({}:{}) expiró. Proveedores como Render (en su plan gratuito) bloquean puertos SMTP salientes (25, 465, 587). Para habilitar envíos sin costo, define la variable de entorno RESEND_API_KEY o BREVO_API_KEY en tu hosting para usar la API HTTPS (puerto 443).", mailHost, mailPort);
            }
        }
    }

    // ── Método de Diagnóstico Sincrónico para Pruebas ──────────────
    public Map<String, Object> probarEnvio(String destinatario) {
        Map<String, Object> r = new LinkedHashMap<>();
        String dest = (destinatario != null && !destinatario.isBlank()) ? destinatario.trim() : "realmercatto@gmail.com";
        r.put("destinatario", dest);
        r.put("smtpHost", mailHost);
        r.put("smtpPort", mailPort);
        r.put("smtpUsername", remitente);
        r.put("resendConfigurado", resendApiKey != null && !resendApiKey.isBlank());
        r.put("brevoConfigurado", brevoApiKey != null && !brevoApiKey.isBlank());

        String asuntoPrueba = "Prueba de Diagnóstico — Mercatto";
        String htmlPrueba = """
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
              <div style="background:#7c3aed;padding:16px;border-radius:8px;text-align:center;color:#ffffff;">
                <h2 style="margin:0;font-size:20px;">¡Mercatto Correo Operativo! 🚀</h2>
              </div>
              <div style="padding:16px 0;color:#334155;line-height:1.5;">
                <p>Este es un correo de prueba emitido para validar las credenciales y la conectividad del servidor.</p>
                <p><strong>Estado:</strong> Conexión y autenticación exitosas.</p>
              </div>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:12px 0;" />
              <p style="font-size:11px;color:#94a3b8;margin:0;">Mercatto Marketplace — Diagnóstico de Envíos</p>
            </div>
            """;

        // Probar Resend si está activo
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            boolean ok = enviarPorResend(dest, asuntoPrueba, htmlPrueba);
            r.put("exito", ok);
            r.put("metodo", "RESEND_API (HTTPS / 443)");
            r.put("mensaje", ok ? "Correo de prueba enviado exitosamente vía Resend API." : "Fallo al enviar vía Resend API. Revisa RESEND_API_KEY.");
            return r;
        }

        // Probar Brevo si está activo
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            boolean ok = enviarPorBrevo(dest, asuntoPrueba, htmlPrueba);
            r.put("exito", ok);
            r.put("metodo", "BREVO_API (HTTPS / 443)");
            r.put("mensaje", ok ? "Correo de prueba enviado exitosamente vía Brevo API." : "Fallo al enviar vía Brevo API. Revisa BREVO_API_KEY.");
            return r;
        }

        // Probar SMTP directamente de forma sincrónica
        if (mailSender == null) {
            r.put("exito", false);
            r.put("metodo", "SMTP (" + mailHost + ":" + mailPort + ")");
            r.put("error", "mailSender es nulo. Revisa la configuración de Spring Mail.");
            return r;
        }

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
            helper.setTo(dest);
            helper.setSubject(asuntoPrueba);
            helper.setText(htmlPrueba, true);
            helper.setFrom(getRemitenteSeguro(), "Mercatto");

            mailSender.send(mensaje);
            r.put("exito", true);
            r.put("metodo", "SMTP (" + mailHost + ":" + mailPort + ")");
            r.put("mensaje", "Correo de prueba enviado exitosamente por SMTP a " + dest);
        } catch (Exception e) {
            r.put("exito", false);
            r.put("metodo", "SMTP (" + mailHost + ":" + mailPort + ")");
            r.put("error", e.getMessage());
            r.put("claseError", e.getClass().getName());

            String msg = (e.getMessage() != null) ? e.getMessage().toLowerCase() : "";
            if (msg.contains("timed out") || msg.contains("connection refused") || msg.contains("could not connect")) {
                r.put("diagnostico", "El servidor no pudo establecer conexión TCP con el servidor SMTP (" + mailHost + ":" + mailPort + "). " +
                        "En plataformas como Render (plan gratuito), los puertos SMTP salientes (25, 465, 587) están bloqueados por seguridad.");
                r.put("solucionRecomendada", "Configura la variable de entorno RESEND_API_KEY o BREVO_API_KEY en Render para enviar correos vía HTTPS (puerto 443).");
            } else if (msg.contains("authentication") || msg.contains("535") || msg.contains("badcredentials") || msg.contains("username and password not accepted")) {
                r.put("diagnostico", "Error de autenticación con Google Gmail. La contraseña de aplicación puede haber caducado o ser incorrecta.");
                r.put("solucionRecomendada", "Genera una nueva contraseña de aplicación de 16 caracteres en myaccount.google.com/apppasswords y actualiza SPRING_MAIL_PASSWORD.");
            } else if (msg.contains("pkix") || msg.contains("handshake") || msg.contains("certificate")) {
                r.put("diagnostico", "Falla de validación de certificado SSL.");
                r.put("solucionRecomendada", "Verifica la propiedad spring.mail.properties.mail.smtp.ssl.trust=*");
            }
        }
        return r;
    }

    private boolean enviarPorResend(String destinatario, String asunto, String html) {
        if (resendApiKey == null || resendApiKey.isBlank()) return false;
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            String fromHeader = (resendFrom != null && !resendFrom.isBlank()) ? resendFrom.trim() : "Mercatto <onboarding@resend.dev>";
            String payload = String.format("""
                {
                  "from": "%s",
                  "to": ["%s"],
                  "subject": %s,
                  "html": %s
                }
                """,
                fromHeader,
                destinatario,
                escaparJson(asunto),
                escaparJson(html)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Correo enviado exitosamente vía Resend API a: {} | Asunto: {}", destinatario, asunto);
                return true;
            } else {
                log.warn("Resend API respondió con status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.warn("Error enviando por Resend API a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }

    private boolean enviarPorBrevo(String destinatario, String asunto, String html) {
        if (brevoApiKey == null || brevoApiKey.isBlank()) return false;
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            String fromEmail = (brevoFrom != null && !brevoFrom.isBlank()) ? brevoFrom.trim() : getRemitenteSeguro();
            String payload = String.format("""
                {
                  "sender": {"name": "Mercatto", "email": "%s"},
                  "to": [{"email": "%s"}],
                  "subject": %s,
                  "htmlContent": %s
                }
                """,
                fromEmail,
                destinatario,
                escaparJson(asunto),
                escaparJson(html)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey.trim())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Correo enviado exitosamente vía Brevo API a: {} | Asunto: {}", destinatario, asunto);
                return true;
            } else {
                log.warn("Brevo API respondió con status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.warn("Error enviando por Brevo API a {}: {}", destinatario, e.getMessage());
            return false;
        }
    }

    private String escaparJson(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (char c : s.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        sb.append("\"");
        return sb.toString();
    }

    
    // ── 1. RECIBO DE PAGO CONFIRMADO / FACTURA PARA EL COMPRADOR ────────
    @Async
    public void enviarReciboPagoComprador(Pedido pedido, Pago pago) {
        if (pedido == null || pedido.getComprador() == null || pedido.getComprador().getEmail() == null) {
            log.warn("No se pudo enviar el recibo de pago: información de comprador o email ausente.");
            return;
        }

        String email = pedido.getComprador().getEmail();
        String nombreComprador = pedido.getComprador().getNombre() != null && !pedido.getComprador().getNombre().isBlank()
                ? pedido.getComprador().getNombre()
                : "Apreciado/a Cliente";

        String codigoPedido = pedido.getCodigo() != null ? pedido.getCodigo() : "PED-" + pedido.getId();

        // Formato método de pago legible
        String metodoNombre = "Wompi (Pasarela Segura)";
        if (pago != null && pago.getMetodo() != null) {
            metodoNombre = switch (pago.getMetodo()) {
                case WOMPI -> "Wompi (Bancolombia / PSE / Nequi / Tarjeta)";
                case NEQUI -> "Nequi";
                case PSE -> "PSE (Transferencia en línea)";
                case TARJETA_CREDITO, STRIPE -> "Tarjeta de Crédito / Débito";
                case DAVIPLATA -> "Daviplata";
                case CONTRA_ENTREGA -> "Pago Contra Entrega en Efectivo";
                default -> pago.getMetodo().name();
            };
        }

        // Referencia
        String transaccionRef = "APROBADO";
        if (pago != null && pago.getTransaccionId() != null && !pago.getTransaccionId().isBlank()) {
            transaccionRef = pago.getTransaccionId();
        } else if (pago != null && pago.getPasarelaReferencia() != null && !pago.getPasarelaReferencia().isBlank()) {
            transaccionRef = pago.getPasarelaReferencia();
        }

        // Fecha de pago
        LocalDateTime fecha = (pago != null && pago.getFechaPago() != null) ? pago.getFechaPago() : LocalDateTime.now();
        String fechaTexto = fecha.format(FECHA_FORMATTER);

        // Filas de productos
        StringBuilder filasHtml = new StringBuilder();
        if (pedido.getItems() != null) {
            for (PedidoItem item : pedido.getItems()) {
                String nombreProd = item.getNombreProducto() != null ? item.getNombreProducto() : "Artículo Mercatto";
                String varianteTag = "";
                if (item.getNombreVariante() != null && !item.getNombreVariante().isBlank()) {
                    varianteTag = "<div style=\"margin-top:4px;\"><span style=\"display:inline-block;padding:2px 8px;border-radius:12px;background:#f3e8ff;color:#7c3aed;font-size:11px;font-weight:600;\">"
                            + escaparHtml(item.getNombreVariante()) + "</span></div>";
                }

                String imagenTag = "";
                if (item.getImagenUrl() != null && !item.getImagenUrl().isBlank()) {
                    imagenTag = "<td style=\"width:54px;vertical-align:middle;padding-right:12px;\"><img src=\""
                            + item.getImagenUrl() + "\" alt=\"" + escaparHtml(nombreProd)
                            + "\" style=\"width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0;display:block;\" /></td>";
                }

                filasHtml.append("""
                    <tr style="border-bottom:1px solid #f1f5f9;">
                      <td style="padding:12px 10px;vertical-align:middle;">
                        <table style="border-collapse:collapse;width:100%%;">
                          <tr>
                            %s
                            <td style="vertical-align:middle;">
                              <div style="font-weight:600;color:#0f172a;font-size:14px;line-height:1.3;">%s</div>
                              %s
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding:12px 10px;text-align:center;vertical-align:middle;color:#64748b;font-weight:600;font-size:13px;">
                        %d un.
                      </td>
                      <td style="padding:12px 10px;text-align:right;vertical-align:middle;font-weight:700;color:#0f172a;font-size:14px;">
                        $%,.0f COP
                      </td>
                    </tr>
                    """.formatted(imagenTag, escaparHtml(nombreProd), varianteTag, item.getCantidad(), item.getSubtotal()));
            }
        }

        // Totales
        double subtotal = pedido.getSubtotal() != null ? pedido.getSubtotal() : 0.0;
        double descuento = pedido.getDescuento() != null ? pedido.getDescuento() : 0.0;
        double costoEnvio = pedido.getCostoEnvio() != null ? pedido.getCostoEnvio() : 0.0;
        double total = pedido.getTotal() != null ? pedido.getTotal() : (subtotal - descuento + costoEnvio);

        String descuentoHtml = "";
        if (descuento > 0) {
            descuentoHtml = """
                <tr>
                  <td style="padding:5px 0;color:#059669;font-weight:600;">Descuento Promocional</td>
                  <td style="padding:5px 0;text-align:right;font-weight:700;color:#059669;">-$%,.0f COP</td>
                </tr>
                """.formatted(descuento);
        }

        String envioTexto = (costoEnvio <= 0)
                ? "<span style=\"color:#059669;font-weight:700;\">Envío Gratis a Cartagena</span>"
                : String.format(COLOMBIA_LOCALE, "$%,.0f COP", costoEnvio);

        // Dirección de entrega
        Direccion dir = pedido.getDireccion();
        String nombreDest = (dir != null && dir.getNombreCompleto() != null && !dir.getNombreCompleto().isBlank())
                ? dir.getNombreCompleto() : nombreComprador;
        String telDest = (dir != null && dir.getTelefono() != null && !dir.getTelefono().isBlank())
                ? dir.getTelefono() : (pedido.getComprador().getTelefono() != null ? pedido.getComprador().getTelefono() : "No especificado");
        String dirDest = (dir != null && dir.getDireccion() != null && !dir.getDireccion().isBlank())
                ? dir.getDireccion() : "Entrega en Cartagena de Indias";
        String barrioDest = (dir != null && dir.getBarrio() != null && !dir.getBarrio().isBlank())
                ? "Barrio: " + dir.getBarrio() : "";
        String ciudadDest = (dir != null && dir.getCiudad() != null && !dir.getCiudad().isBlank())
                ? dir.getCiudad() : "Cartagena de Indias";

        String notasHtml = "";
        if (dir != null && dir.getNotasEntrega() != null && !dir.getNotasEntrega().isBlank()) {
            notasHtml = """
                <div style="margin-top:10px;padding:10px 12px;background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;font-size:12px;color:#92400e;">
                  <strong>Instrucciones para el repartidor:</strong> %s
                </div>
                """.formatted(escaparHtml(dir.getNotasEntrega()));
        }

        String html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Recibo de Pago Mercatto</title>
            </head>
            <body style="margin:0;padding:28px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
              <table role="presentation" style="width:100%%;border-collapse:collapse;">
                <tr>
                  <td align="center">
                    <div style="max-width:620px;width:100%%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 30px -8px rgba(124,58,237,0.12);text-align:left;">

                      <!-- CABECERA PRINCIPAL VIOLETA MERCATTO -->
                      <div style="background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 55%%, #4c1d95 100%%);padding:36px 32px 32px;text-align:center;color:#ffffff;">
                        <div style="display:inline-block;padding:5px 16px;background:rgba(255,255,255,0.18);border-radius:20px;font-size:11px;letter-spacing:1.8px;font-weight:700;text-transform:uppercase;margin-bottom:14px;">
                          MERCATTO • COMPROBANTE OFICIAL
                        </div>
                        <h1 style="margin:0;font-size:25px;font-weight:800;letter-spacing:-0.4px;">¡Tu Pago ha sido Confirmado!</h1>
                        <p style="margin:10px 0 0;font-size:15px;color:#ede9fe;line-height:1.5;">
                          Hola <strong>%s</strong>, recibimos tu pago con éxito. Tus artículos ya están siendo preparados por las tiendas en Cartagena.
                        </p>
                      </div>

                      <div style="padding:28px 30px 24px;background:#ffffff;">

                        <!-- TARJETA DE RESUMEN DE LA TRANSACCIÓN -->
                        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
                          <table style="width:100%%;border-collapse:collapse;font-size:13px;">
                            <tr>
                              <td style="padding:5px 0;color:#6b21a8;font-weight:600;">N° de Pedido:</td>
                              <td style="padding:5px 0;text-align:right;font-weight:800;color:#7c3aed;font-family:monospace;font-size:15px;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;color:#6b21a8;font-weight:600;">Estado del Pago:</td>
                              <td style="padding:5px 0;text-align:right;">
                                <span style="display:inline-block;padding:3px 12px;background:#ecfdf5;color:#059669;font-weight:700;border-radius:20px;font-size:12px;border:1px solid #a7f3d0;">
                                  ✔ APROBADO Y PAGADO
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;color:#6b21a8;font-weight:600;">Método de Pago:</td>
                              <td style="padding:5px 0;text-align:right;font-weight:600;color:#1e1b4b;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;color:#6b21a8;font-weight:600;">Referencia / Transacción:</td>
                              <td style="padding:5px 0;text-align:right;font-family:monospace;font-size:12px;color:#4c1d95;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:5px 0;color:#6b21a8;font-weight:600;">Fecha de Confirmación:</td>
                              <td style="padding:5px 0;text-align:right;color:#1e1b4b;font-weight:500;">%s</td>
                            </tr>
                          </table>
                        </div>

                        <!-- LISTA DE ARTÍCULOS -->
                        <h3 style="margin:0 0 12px;font-size:15px;color:#0f172a;font-weight:700;border-bottom:2px solid #ede9fe;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                          Detalle de Artículos Adquiridos
                        </h3>
                        <table style="width:100%%;border-collapse:collapse;margin-bottom:24px;">
                          <thead>
                            <tr style="background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:left;">
                              <th style="padding:9px 10px;border-radius:6px 0 0 6px;">Producto</th>
                              <th style="padding:9px 10px;text-align:center;">Cant.</th>
                              <th style="padding:9px 10px;text-align:right;border-radius:0 6px 6px 0;">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            %s
                          </tbody>
                        </table>

                        <!-- TOTALES Y DESGLOSE FINANCIERO -->
                        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
                          <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                            <tr>
                              <td style="padding:5px 0;color:#64748b;">Subtotal</td>
                              <td style="padding:5px 0;text-align:right;font-weight:600;color:#0f172a;">$%,.0f COP</td>
                            </tr>
                            %s
                            <tr>
                              <td style="padding:5px 0;color:#64748b;">Costo de Envío</td>
                              <td style="padding:5px 0;text-align:right;font-weight:600;color:#0f172a;">%s</td>
                            </tr>
                            <tr style="border-top:1px solid #e2e8f0;">
                              <td style="padding:14px 0 4px;font-size:16px;font-weight:800;color:#0f172a;">Total Pagado</td>
                              <td style="padding:14px 0 4px;text-align:right;font-size:20px;font-weight:800;color:#7c3aed;">$%,.0f COP</td>
                            </tr>
                          </table>
                        </div>

                        <!-- DIRECCIÓN DE ENVÍO -->
                        <div style="border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin-bottom:28px;background:#ffffff;">
                          <div style="font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;">
                            📍 Información de Entrega (Cartagena de Indias)
                          </div>
                          <p style="margin:0 0 3px;font-size:14px;color:#0f172a;font-weight:700;">%s &nbsp;•&nbsp; <span style="font-weight:500;color:#64748b;">Tel: %s</span></p>
                          <p style="margin:0 0 3px;font-size:13px;color:#334155;"><strong>Dirección:</strong> %s %s</p>
                          <p style="margin:0;font-size:13px;color:#334155;"><strong>Ciudad:</strong> %s, Colombia</p>
                          %s
                        </div>

                        <!-- BOTÓN DE SEGUIMIENTO -->
                        <div style="text-align:center;margin:30px 0 10px;">
                          <a href="https://mercatto-ashy.vercel.app/mis-pedidos" target="_blank"
                             style="display:inline-block;background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:30px;box-shadow:0 6px 18px rgba(124,58,237,0.32);">
                            Ver Estado de mi Pedido en Mercatto
                          </a>
                        </div>
                        <p style="text-align:center;font-size:12px;color:#94a3b8;margin:8px 0 0;">
                          Podrás consultar el estado y avance de tu entrega en cualquier momento.
                        </p>

                      </div>

                      <!-- FOOTER ELEGANTE -->
                      <div style="background:#f8fafc;padding:26px 32px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
                        <p style="margin:0 0 6px;font-weight:700;color:#475569;font-size:13px;">Mercatto Marketplace — Cartagena de Indias, Colombia</p>
                        <p style="margin:0 0 6px;color:#64748b;">Transacción procesada y confirmada de forma segura.</p>
                        <p style="margin:0 0 8px;">¿Necesitas ayuda con este pedido? Escríbenos a <a href="mailto:realmercatto@gmail.com" style="color:#7c3aed;text-decoration:none;font-weight:600;">realmercatto@gmail.com</a></p>
                        <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 Mercatto. Todos los derechos reservados.</p>
                      </div>

                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                escaparHtml(nombreComprador),
                codigoPedido,
                metodoNombre,
                transaccionRef,
                fechaTexto,
                filasHtml.toString(),
                subtotal,
                descuentoHtml,
                envioTexto,
                total,
                escaparHtml(nombreDest),
                escaparHtml(telDest),
                escaparHtml(dirDest),
                (!barrioDest.isBlank() ? "— " + escaparHtml(barrioDest) : ""),
                escaparHtml(ciudadDest),
                notasHtml
        );

        String asunto = "¡Pago Confirmado! Pedido " + codigoPedido + " — Recibo de Compra Mercatto";
        enviarHtml(email, asunto, html);
    }

    // ── 2. NOTIFICACIÓN DE VENTA CONFIRMADA PARA LA TIENDA / VENDEDOR ────
    @Async
    public void enviarNotificacionVentaPagada(Vendedor vendedor, Pedido pedido, List<PedidoItem> itemsVendedor) {
        if (vendedor == null || vendedor.getUsuario() == null || vendedor.getUsuario().getEmail() == null) {
            return;
        }

        String emailTienda = vendedor.getUsuario().getEmail();
        String nombreTienda = vendedor.getNombreTienda() != null ? vendedor.getNombreTienda() : "Vendedor Mercatto";
        String codigoPedido = pedido.getCodigo() != null ? pedido.getCodigo() : "PED-" + pedido.getId();

        StringBuilder filasHtml = new StringBuilder();
        double subtotalTienda = 0.0;
        double netoTienda = 0.0;

        for (PedidoItem item : itemsVendedor) {
            subtotalTienda += item.getSubtotal();
            if (item.getNetoVendedor() != null) {
                netoTienda += item.getNetoVendedor();
            } else {
                netoTienda += item.getSubtotal() * 0.90; // Fallback 10% comisión estimada
            }

            String nombreProd = item.getNombreProducto() != null ? item.getNombreProducto() : "Artículo";
            String variante = (item.getNombreVariante() != null && !item.getNombreVariante().isBlank())
                    ? " (" + item.getNombreVariante() + ")" : "";

            filasHtml.append("""
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:10px 8px;font-size:13px;color:#0f172a;font-weight:600;">%s%s</td>
                  <td style="padding:10px 8px;text-align:center;font-size:13px;color:#64748b;">%d un.</td>
                  <td style="padding:10px 8px;text-align:right;font-size:13px;color:#0f172a;font-weight:700;">$%,.0f COP</td>
                </tr>
                """.formatted(escaparHtml(nombreProd), escaparHtml(variante), item.getCantidad(), item.getSubtotal()));
        }

        Direccion dir = pedido.getDireccion();
        String clienteNombre = (dir != null && dir.getNombreCompleto() != null) ? dir.getNombreCompleto() : (pedido.getComprador() != null ? pedido.getComprador().getNombre() : "Cliente");
        String clienteTel = (dir != null && dir.getTelefono() != null) ? dir.getTelefono() : "No especificado";
        String destino = (dir != null && dir.getDireccion() != null) ? dir.getDireccion() : "Cartagena de Indias";
        String barrio = (dir != null && dir.getBarrio() != null) ? "Barrio: " + dir.getBarrio() : "";

        String html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
              <table role="presentation" style="width:100%%;border-collapse:collapse;">
                <tr>
                  <td align="center">
                    <div style="max-width:600px;width:100%%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(0,0,0,0.06);text-align:left;">

                      <div style="background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%);padding:32px 28px;text-align:center;color:#ffffff;">
                        <div style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">
                          ¡VENTA CONFIRMADA Y PAGADA! 💰
                        </div>
                        <h1 style="margin:0;font-size:22px;font-weight:800;">Nueva Venta en %s</h1>
                        <p style="margin:8px 0 0;font-size:14px;color:#ede9fe;">Pedido confirmado: <strong>%s</strong></p>
                      </div>

                      <div style="padding:24px 28px;">
                        <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">
                          Hola <strong>%s</strong>, el cliente ha completado el pago de su orden. Por favor prepara los siguientes productos para despacho en Cartagena:
                        </p>

                        <table style="width:100%%;border-collapse:collapse;margin-bottom:20px;">
                          <thead>
                            <tr style="background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;">
                              <th style="padding:8px;">Producto</th>
                              <th style="padding:8px;text-align:center;">Cant.</th>
                              <th style="padding:8px;text-align:right;">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            %s
                          </tbody>
                        </table>

                        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;">
                          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span style="color:#64748b;">Subtotal de tus productos:</span>
                            <strong style="color:#0f172a;">$%,.0f COP</strong>
                          </div>
                          <div style="display:flex;justify-content:space-between;padding-top:6px;border-top:1px solid #e2e8f0;font-size:15px;">
                            <span style="font-weight:700;color:#0f172a;">Tu Neto a Liquidar:</span>
                            <strong style="color:#059669;font-size:16px;">$%,.0f COP</strong>
                          </div>
                        </div>

                        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;">
                          <strong style="color:#7c3aed;text-transform:uppercase;font-size:11px;display:block;margin-bottom:6px;">📦 Datos para el Envío (Cartagena)</strong>
                          <p style="margin:0 0 3px;color:#0f172a;"><strong>Cliente:</strong> %s (Tel: %s)</p>
                          <p style="margin:0;color:#475569;"><strong>Dirección:</strong> %s %s</p>
                        </div>

                        <div style="text-align:center;">
                          <a href="https://mercatto-ashy.vercel.app/panel-vendedor" target="_blank"
                             style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:24px;">
                            Ir al Panel Vendedor para Gestionar el Envío
                          </a>
                        </div>
                      </div>

                      <div style="background:#f8fafc;padding:18px 24px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">
                        Mercatto Marketplace — Comercio y Distribución en Cartagena de Indias
                      </div>

                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                escaparHtml(nombreTienda),
                codigoPedido,
                escaparHtml(nombreTienda),
                filasHtml.toString(),
                subtotalTienda,
                netoTienda,
                escaparHtml(clienteNombre),
                escaparHtml(clienteTel),
                escaparHtml(destino),
                (!barrio.isBlank() ? "— " + escaparHtml(barrio) : "")
        );

        String asunto = "¡Nueva Venta Pagada! Pedido " + codigoPedido + " — " + nombreTienda;
        enviarHtml(emailTienda, asunto, html);
    }

    // ── 3. RESPUESTA A TICKET DE SOPORTE POR EL ADMINISTRADOR ───────────
    @Async
    public void enviarRespuestaTicketSoporte(TicketSoporte ticket, String respuestaAdmin, TicketSoporte.EstadoTicket estado) {
        if (ticket == null || ticket.getEmail() == null || ticket.getEmail().isBlank()) {
            log.warn("No se pudo enviar la respuesta del ticket: información o email ausente.");
            return;
        }

        String email = ticket.getEmail().trim();
        String nombre = (ticket.getNombre() != null && !ticket.getNombre().isBlank()) ? ticket.getNombre().trim() : "Usuario";
        String asuntoTicket = (ticket.getAsunto() != null && !ticket.getAsunto().isBlank()) ? ticket.getAsunto() : "Consulta General";
        Long ticketId = ticket.getId() != null ? ticket.getId() : 0L;

        String fechaTexto = LocalDateTime.now().format(FECHA_FORMATTER);

        String estadoPill = switch (estado != null ? estado : TicketSoporte.EstadoTicket.RESUELTO) {
            case RESUELTO -> "<span style=\"display:inline-block;padding:3px 12px;background:#ecfdf5;color:#059669;font-weight:700;border-radius:20px;font-size:12px;border:1px solid #a7f3d0;\">✔ RESUELTO</span>";
            case EN_GESTION -> "<span style=\"display:inline-block;padding:3px 12px;background:#fef3c7;color:#d97706;font-weight:700;border-radius:20px;font-size:12px;border:1px solid #fde68a;\">EN GESTIÓN</span>";
            default -> "<span style=\"display:inline-block;padding:3px 12px;background:#ede9fe;color:#7c3aed;font-weight:700;border-radius:20px;font-size:12px;border:1px solid #ddd6fe;\">PENDIENTE</span>";
        };

        String respuestaFormateada = escaparHtml(respuestaAdmin != null ? respuestaAdmin : "")
                .replace("\n", "<br/>");

        String mensajeOriginal = escaparHtml(ticket.getMensaje() != null ? ticket.getMensaje() : "")
                .replace("\n", "<br/>");

        String html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Respuesta a Ticket de Soporte Mercatto</title>
            </head>
            <body style="margin:0;padding:28px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
              <table role="presentation" style="width:100%%;border-collapse:collapse;">
                <tr>
                  <td align="center">
                    <div style="max-width:620px;width:100%%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 30px -8px rgba(124,58,237,0.12);text-align:left;">

                      <!-- CABECERA VIOLETA ATENCIÓN AL CLIENTE -->
                      <div style="background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 60%%, #4c1d95 100%%);padding:36px 32px 30px;text-align:center;color:#ffffff;">
                        <div style="display:inline-block;padding:5px 16px;background:rgba(255,255,255,0.18);border-radius:20px;font-size:11px;letter-spacing:1.8px;font-weight:700;text-transform:uppercase;margin-bottom:12px;">
                          CENTRO DE ATENCIÓN Y SOPORTE MERCATTO
                        </div>
                        <h1 style="margin:0;font-size:24px;font-weight:800;letter-spacing:-0.4px;">Respuesta a tu Solicitud</h1>
                        <p style="margin:10px 0 0;font-size:15px;color:#ede9fe;line-height:1.5;">
                          Hola <strong>%s</strong>, nuestro equipo de soporte ha atendido tu consulta.
                        </p>
                      </div>

                      <div style="padding:28px 32px 24px;background:#ffffff;">

                        <!-- TARJETA IDENTIFICADORA DE TICKET -->
                        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;padding:16px 20px;margin-bottom:24px;">
                          <table style="width:100%%;border-collapse:collapse;font-size:13px;">
                            <tr>
                              <td style="padding:4px 0;color:#6b21a8;font-weight:600;">Identificador de Ticket:</td>
                              <td style="padding:4px 0;text-align:right;font-weight:800;color:#7c3aed;font-family:monospace;font-size:15px;">#TICK-%d</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:#6b21a8;font-weight:600;">Asunto:</td>
                              <td style="padding:4px 0;text-align:right;font-weight:700;color:#0f172a;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:#6b21a8;font-weight:600;">Estado de la Solicitud:</td>
                              <td style="padding:4px 0;text-align:right;">%s</td>
                            </tr>
                            <tr>
                              <td style="padding:4px 0;color:#6b21a8;font-weight:600;">Fecha de Atención:</td>
                              <td style="padding:4px 0;text-align:right;color:#1e1b4b;font-weight:500;">%s</td>
                            </tr>
                          </table>
                        </div>

                        <!-- RESPUESTA OFICIAL DESTACADA -->
                        <div style="margin-bottom:26px;">
                          <div style="display:flex;align-items:center;margin-bottom:10px;">
                            <div style="background:#7c3aed;color:#ffffff;border-radius:50%%;width:30px;height:30px;text-align:center;line-height:30px;font-size:14px;font-weight:bold;margin-right:10px;">M</div>
                            <span style="font-size:14px;font-weight:700;color:#0f172a;">Respuesta del Administrador de Mercatto:</span>
                          </div>
                          <div style="background:#f5f3ff;border-left:4px solid #7c3aed;border-radius:0 12px 12px 0;padding:18px 22px;font-size:15px;color:#1e1b4b;line-height:1.7;box-shadow:inset 0 1px 2px rgba(124,58,237,0.04);">
                            %s
                          </div>
                        </div>

                        <!-- CONSULTA ORIGINAL -->
                        <div style="margin-bottom:28px;">
                          <h4 style="margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">
                            Tu Consulta Original:
                          </h4>
                          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;font-size:13px;color:#475569;line-height:1.6;font-style:italic;">
                            “%s”
                          </div>
                        </div>

                        <!-- BOTÓN DE ENLACE -->
                        <div style="text-align:center;margin:28px 0 10px;">
                          <a href="https://mercatto-ashy.vercel.app" target="_blank"
                             style="display:inline-block;background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:30px;box-shadow:0 6px 18px rgba(124,58,237,0.32);">
                            Ir al Portal Mercatto
                          </a>
                        </div>
                        <p style="text-align:center;font-size:12px;color:#94a3b8;margin:8px 0 0;">
                          Si tienes alguna duda adicional, puedes responder a este correo o radicar un nuevo ticket en la plataforma.
                        </p>

                      </div>

                      <!-- FOOTER -->
                      <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
                        <p style="margin:0 0 6px;font-weight:700;color:#475569;">Mercatto Marketplace — Cartagena de Indias, Colombia</p>
                        <p style="margin:0 0 8px;">Centro de Soporte al Cliente • <a href="mailto:realmercatto@gmail.com" style="color:#7c3aed;text-decoration:none;font-weight:600;">realmercatto@gmail.com</a></p>
                        <p style="margin:0;font-size:11px;color:#cbd5e1;">© 2026 Mercatto. Todos los derechos reservados.</p>
                      </div>

                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                escaparHtml(nombre),
                ticketId,
                escaparHtml(asuntoTicket),
                estadoPill,
                fechaTexto,
                respuestaFormateada,
                mensajeOriginal
        );

        String asuntoCorreo = "Respuesta a tu Ticket #" + ticketId + ": " + asuntoTicket + " — Mercatto Soporte";
        enviarHtml(email, asuntoCorreo, html);
    }

    // ── 4. CONFIRMACIÓN GENERAL DE PEDIDO (Compatibilidad / Contra Entrega) ──
    @Async
    public void enviarConfirmacionPedidoComprador(String email, String nombreComprador, String codigoPedido,
                                                    String filasItemsHtml, double subtotal, double descuento,
                                                    double costoEnvio, double total) {
        String descuentoHtml = "";
        if (descuento > 0) {
            descuentoHtml = """
                <tr>
                  <td style="padding:5px 0;color:#059669;font-weight:600;">Descuento</td>
                  <td style="padding:5px 0;text-align:right;font-weight:700;color:#059669;">-$%,.0f COP</td>
                </tr>
                """.formatted(descuento);
        }

        String envioTexto = (costoEnvio <= 0)
                ? "<span style=\"color:#059669;font-weight:700;\">Envío Gratis a Cartagena</span>"
                : String.format(COLOMBIA_LOCALE, "$%,.0f COP", costoEnvio);

        String html = """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Confirmación de Pedido Mercatto</title>
            </head>
            <body style="margin:0;padding:24px 12px;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
              <table role="presentation" style="width:100%%;border-collapse:collapse;">
                <tr>
                  <td align="center">
                    <div style="max-width:620px;width:100%%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 12px 30px -8px rgba(124,58,237,0.12);text-align:left;">

                      <div style="background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%);padding:34px 30px;text-align:center;color:#ffffff;">
                        <div style="display:inline-block;padding:4px 14px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:11px;letter-spacing:1.5px;font-weight:700;text-transform:uppercase;margin-bottom:10px;">
                          MERCATTO • PEDIDO REGISTRADO
                        </div>
                        <h1 style="margin:0;font-size:24px;font-weight:800;">¡Hemos recibido tu pedido!</h1>
                        <p style="margin:8px 0 0;font-size:14px;color:#ede9fe;">
                          Hola <strong>%s</strong>, tu pedido <strong>%s</strong> ha sido registrado satisfactoriamente.
                        </p>
                      </div>

                      <div style="padding:26px 30px;">
                        <table style="width:100%%;border-collapse:collapse;margin-bottom:20px;">
                          <thead>
                            <tr style="background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;">
                              <th style="padding:10px;">Producto</th>
                              <th style="padding:10px;text-align:center;">Cant.</th>
                              <th style="padding:10px;text-align:right;">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>%s</tbody>
                        </table>

                        <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
                          <table style="width:100%%;border-collapse:collapse;font-size:14px;">
                            <tr><td>Subtotal</td><td style="text-align:right;font-weight:600;">$%,.0f COP</td></tr>
                            %s
                            <tr><td>Envío</td><td style="text-align:right;font-weight:600;">%s</td></tr>
                            <tr style="border-top:1px solid #e2e8f0;font-size:16px;font-weight:800;">
                              <td style="padding-top:10px;">Total</td>
                              <td style="text-align:right;padding-top:10px;color:#7c3aed;">$%,.0f COP</td>
                            </tr>
                          </table>
                        </div>

                        <div style="text-align:center;margin:24px 0 10px;">
                          <a href="https://mercatto-ashy.vercel.app/mis-pedidos" target="_blank"
                             style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:24px;">
                            Consultar Mis Pedidos
                          </a>
                        </div>
                      </div>

                      <div style="background:#f8fafc;padding:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">
                        Mercatto Marketplace — Cartagena de Indias, Colombia
                      </div>

                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                escaparHtml(nombreComprador),
                codigoPedido,
                filasItemsHtml,
                subtotal,
                descuentoHtml,
                envioTexto,
                total
        );

        enviarHtml(email, "Confirmación de Pedido " + codigoPedido + " — Mercatto", html);
    }

    // ── 5. NOTIFICACIÓN NUEVA VENTA (Legacy) ───────────────────────────
    @Async
    public void enviarNotificacionNuevaVenta(String email, String nombreTienda, String codigoPedido,
                                               String filasItemsHtml, double totalVendedor) {
        String html = """
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:auto;color:#1e293b;border-radius:14px;border:1px solid #e2e8f0;overflow:hidden;">
              <div style="background:linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%);padding:24px;text-align:center;color:#fff;">
                <h2 style="margin:0;font-size:20px;">¡Nueva venta en %s! 🎉</h2>
                <p style="margin:6px 0 0;font-size:13px;color:#ede9fe;">Pedido: %s</p>
              </div>
              <div style="padding:22px;background:#fff;">
                <p>Hola <strong>%s</strong>, tienes una nueva orden en tu tienda:</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                  <thead>
                    <tr style="background:#f8fafc;text-align:left;font-size:12px;color:#64748b;">
                      <th style="padding:8px">Producto</th>
                      <th style="padding:8px;text-align:center">Cant.</th>
                      <th style="padding:8px;text-align:right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <p style="font-weight:bold;color:#7c3aed;font-size:15px;">Total de tu parte: $%,.0f COP</p>
                <div style="text-align:center;margin-top:20px;">
                  <a href="https://mercatto-ashy.vercel.app/panel-vendedor" style="background:#7c3aed;color:#fff;padding:10px 24px;border-radius:20px;text-decoration:none;font-weight:600;font-size:13px;">
                    Ir al Panel Vendedor
                  </a>
                </div>
              </div>
            </div>
            """.formatted(escaparHtml(nombreTienda), codigoPedido, escaparHtml(nombreTienda), filasItemsHtml, totalVendedor);

        enviarHtml(email, "Nueva venta — Pedido " + codigoPedido, html);
    }

    private String escaparHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#39;");
    }
}
