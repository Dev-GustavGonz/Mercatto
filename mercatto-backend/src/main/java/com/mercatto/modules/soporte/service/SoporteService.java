package com.mercatto.modules.soporte.service;

import com.mercatto.dto.request.TicketSoporteRequest;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.soporte.model.TicketSoporte;
import com.mercatto.modules.soporte.repository.TicketSoporteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class SoporteService {

    private static final Logger log = LoggerFactory.getLogger(SoporteService.class);

    @Autowired
    private TicketSoporteRepository ticketRepo;

    @Autowired
    private EmailService emailService;

    // Crear ticket público (desde el chatbot del visitante o página de soporte)
    public TicketSoporte crearTicket(TicketSoporteRequest req) {
        TicketSoporte ticket = new TicketSoporte(
                req.getNombre(),
                req.getEmail(),
                req.getTelefono(),
                req.getAsunto() != null && !req.getAsunto().isBlank() ? req.getAsunto() : "Consulta desde Asistente Mercatto",
                req.getMensaje()
        );

        TicketSoporte guardado = ticketRepo.save(ticket);

        // Notificación por correo al Administrador si está configurado
        try {
            String cuerpoNotificacion = String.format(
                    "<h3>Nuevo mensaje de soporte recibido en Mercatto</h3>" +
                    "<p><strong>Remitente:</strong> %s (%s)</p>" +
                    "<p><strong>Teléfono:</strong> %s</p>" +
                    "<p><strong>Asunto:</strong> %s</p>" +
                    "<p><strong>Mensaje:</strong></p>" +
                    "<blockquote style='background:#f8fafc;padding:12px;border-left:4px solid #4f46e5;'>%s</blockquote>" +
                    "<p><a href='http://localhost:5173/admin' style='color:#4f46e5;font-weight:bold;'>Ir al Panel de Administración para responder</a></p>",
                    guardado.getNombre(), guardado.getEmail(),
                    guardado.getTelefono() != null ? guardado.getTelefono() : "No indicado",
                    guardado.getAsunto(), guardado.getMensaje()
            );
            emailService.enviarHtml("realmercatto@gmail.com", "Nuevo Ticket de Soporte #" + guardado.getId() + " - " + guardado.getAsunto(), cuerpoNotificacion);
        } catch (Exception e) {
            log.warn("No se pudo notificar al admin por correo del nuevo ticket #{}: {}", guardado.getId(), e.getMessage());
        }

        return guardado;
    }

    // Listar tickets por email del usuario autenticado
    public List<TicketSoporte> obtenerTicketsPorEmail(String email) {
        if (email == null || email.isBlank()) {
            return Collections.emptyList();
        }
        return ticketRepo.findByEmailIgnoreCaseOrderByFechaCreacionDesc(email);
    }

    // Listar tickets para el panel de administración
    public Page<TicketSoporte> listarTickets(TicketSoporte.EstadoTicket estado, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        if (estado != null) {
            return ticketRepo.findByEstado(estado, pageable);
        }
        return ticketRepo.findAll(pageable);
    }

    // Responder o cambiar estado del ticket por el Administrador
    public TicketSoporte responderTicket(Long id, String respuestaAdmin, TicketSoporte.EstadoTicket nuevoEstado) {
        TicketSoporte ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket de soporte no encontrado con id " + id));

        if (respuestaAdmin != null && !respuestaAdmin.isBlank()) {
            ticket.setRespuestaAdmin(respuestaAdmin);
            ticket.setFechaRespuesta(LocalDateTime.now());

            // Enviar respuesta por email directamente a la dirección de correo del usuario
            if (ticket.getEmail() != null && !ticket.getEmail().isBlank()) {
                try {
                    String nombreDestinatario = ticket.getNombre() != null && !ticket.getNombre().isBlank() ? ticket.getNombre() : "Usuario";
                    String asuntoCorreo = "Respuesta de Soporte Mercatto - Ticket #" + ticket.getId();

                    String cuerpoRespuestaHtml = String.format(
                            "<div style='font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;'>" +
                            "  <div style='background:#7c3aed;padding:24px;text-align:center;color:#ffffff;'>" +
                            "    <h2 style='margin:0;font-size:22px;'>MERCATTO SOPORTE</h2>" +
                            "  </div>" +
                            "  <div style='padding:24px;background:#ffffff;'>" +
                            "    <p>Hola <strong>%s</strong>,</p>" +
                            "    <p>El equipo de soporte de Mercatto ha respondido a tu solicitud:</p>" +
                            "    <div style='background:#f8fafc;padding:16px;border-left:4px solid #7c3aed;border-radius:6px;margin:16px 0;font-size:14px;color:#0f172a;line-height:1.6;'>%s</div>" +
                            "    <p style='margin-top:20px;font-size:13px;color:#64748b;'><strong>Tu consulta original:</strong></p>" +
                            "    <blockquote style='color:#64748b;font-size:12px;margin:8px 0;padding-left:12px;border-left:2px solid #cbd5e1;'>%s</blockquote>" +
                            "    <hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0;' />" +
                            "    <p style='font-size:11px;color:#94a3b8;margin:0;'>Mercatto Colombia — Comercio Electrónico y Marketplace Multitienda</p>" +
                            "  </div>" +
                            "</div>",
                            nombreDestinatario,
                            respuestaAdmin.replace("\n", "<br/>"),
                            ticket.getMensaje() != null ? ticket.getMensaje().replace("\n", "<br/>") : ""
                    );

                    emailService.enviarHtml(ticket.getEmail(), asuntoCorreo, cuerpoRespuestaHtml);
                    emailService.enviarNotificacion(
                            ticket.getEmail(),
                            asuntoCorreo,
                            "Hola " + nombreDestinatario + ",\n\n" +
                            "El equipo de soporte de Mercatto ha respondido a tu consulta:\n\n" +
                            respuestaAdmin + "\n\n" +
                            "Consulta original:\n" + (ticket.getMensaje() != null ? ticket.getMensaje() : "") + "\n\n" +
                            "Atentamente,\nEquipo de Soporte Mercatto"
                    );

                    log.info("Correo de respuesta enviado exitosamente al usuario {}", ticket.getEmail());
                } catch (Exception e) {
                    log.error("Error al enviar email de respuesta al ticket #{}: {}", ticket.getId(), e.getMessage());
                }
            }
        }

        if (nuevoEstado != null) {
            ticket.setEstado(nuevoEstado);
        } else if (respuestaAdmin != null && !respuestaAdmin.isBlank()) {
            ticket.setEstado(TicketSoporte.EstadoTicket.RESUELTO);
        }

        return ticketRepo.save(ticket);
    }

    public long contarPendientes() {
        return ticketRepo.countByEstado(TicketSoporte.EstadoTicket.PENDIENTE);
    }
}
