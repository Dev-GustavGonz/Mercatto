package com.mercatto.modules.soporte.service;

import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.producto.model.Producto;

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

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String remitente;

    // ── Texto plano (compatibilidad con lo que ya existía) ──────────
    @Async
    public void enviarNotificacion(String destinatario, String asunto, String cuerpo) {
        if (mailSender == null) return;
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(destinatario);
            msg.setSubject(asunto);
            msg.setText(cuerpo);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo a {}: {}", destinatario, e.getMessage());
        }
    }

    // ── HTML ──────────────────────────────────────────────────────
    @Async
    public void enviarHtml(String destinatario, String asunto, String html) {
        if (mailSender == null) {
            log.info("Correo no configurado (mailSender=null). Se omite envío a {} — asunto: {}", destinatario, asunto);
            return;
        }
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, false, "UTF-8");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(html, true);
            if (remitente != null && !remitente.isBlank() && !remitente.contains("TU_CORREO")) {
                helper.setFrom(remitente, "Mercatto");
            }
            mailSender.send(mensaje);
        } catch (Exception e) {
            log.warn("No se pudo enviar el correo HTML a {}: {}", destinatario, e.getMessage());
        }
    }

    // ── Confirmación de pedido para el comprador ─────────────────────
    @Async
    public void enviarConfirmacionPedidoComprador(String email, String nombreComprador, String codigoPedido,
                                                    String filasItemsHtml, double subtotal, double descuento,
                                                    double costoEnvio, double total) {
        String html = """
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#1e293b">
              <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:22px">MERCATTO</h1>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
                <p>Hola <strong>%s</strong>,</p>
                <p>¡Gracias por tu compra! Hemos recibido tu pedido <strong>%s</strong> y ya está siendo procesado.</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                  <thead>
                    <tr style="background:#f1f5f9;text-align:left">
                      <th style="padding:8px">Producto</th>
                      <th style="padding:8px">Cant.</th>
                      <th style="padding:8px">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <table style="width:100%%;margin-top:8px">
                  <tr><td>Subtotal</td><td style="text-align:right">$%,.0f</td></tr>
                  <tr><td>Descuento</td><td style="text-align:right">-$%,.0f</td></tr>
                  <tr><td>Envío</td><td style="text-align:right">$%,.0f</td></tr>
                  <tr style="font-weight:bold;font-size:16px">
                    <td style="padding-top:8px">Total</td>
                    <td style="text-align:right;padding-top:8px">$%,.0f COP</td>
                  </tr>
                </table>
                <p style="margin-top:24px;font-size:12px;color:#64748b">
                  Te avisaremos por correo cuando tu pedido cambie de estado. Puedes hacer seguimiento
                  desde la sección "Mis Pedidos" en tu cuenta de Mercatto.
                </p>
              </div>
            </div>
            """.formatted(nombreComprador, codigoPedido, filasItemsHtml, subtotal, descuento, costoEnvio, total);

        enviarHtml(email, "Confirmación de tu pedido " + codigoPedido + " — Mercatto", html);
    }

    // ── Nueva venta para el vendedor ─────────────────────────────────
    @Async
    public void enviarNotificacionNuevaVenta(String email, String nombreTienda, String codigoPedido,
                                               String filasItemsHtml, double totalVendedor) {
        String html = """
            <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#1e293b">
              <div style="background:#059669;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:22px">¡Nueva venta! 🎉</h1>
              </div>
              <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 12px 12px">
                <p>Hola <strong>%s</strong>,</p>
                <p>Tienes una nueva venta asociada al pedido <strong>%s</strong>:</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                  <thead>
                    <tr style="background:#f1f5f9;text-align:left">
                      <th style="padding:8px">Producto</th>
                      <th style="padding:8px">Cant.</th>
                      <th style="padding:8px">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>%s</tbody>
                </table>
                <p style="font-weight:bold">Total de tu parte: $%,.0f COP</p>
                <p style="margin-top:16px">Ingresa a tu panel de vendedor para preparar el envío.</p>
              </div>
            </div>
            """.formatted(nombreTienda, codigoPedido, filasItemsHtml, totalVendedor);

        enviarHtml(email, "Nueva venta — Pedido " + codigoPedido, html);
    }
}
