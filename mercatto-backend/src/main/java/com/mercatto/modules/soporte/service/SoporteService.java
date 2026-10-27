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

            // Enviar respuesta por email directamente a la dirección de correo del usuario con formato elegante
            if (ticket.getEmail() != null && !ticket.getEmail().isBlank()) {
                try {
                    TicketSoporte.EstadoTicket estadoParaCorreo = (nuevoEstado != null) ? nuevoEstado : TicketSoporte.EstadoTicket.RESUELTO;
                    emailService.enviarRespuestaTicketSoporte(ticket, respuestaAdmin, estadoParaCorreo);
                    log.info("Correo elegante de respuesta enviado exitosamente al usuario {}", ticket.getEmail());
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
