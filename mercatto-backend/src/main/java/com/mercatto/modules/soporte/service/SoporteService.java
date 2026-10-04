package com.mercatto.modules.soporte.service;

import com.mercatto.modules.soporte.model.Mensaje;

import com.mercatto.dto.request.TicketSoporteRequest;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.soporte.model.TicketSoporte;
import com.mercatto.modules.soporte.repository.TicketSoporteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SoporteService {

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
                req.getAsunto() != null && !req.getAsunto().isBlank() ? req.getAsunto() : "Consulta desde Chat Asistente Mercatto",
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
                    "<blockquote>%s</blockquote>" +
                    "<p>Puedes gestionarlo directamente desde tu Panel de Administrador en la pestaña Soporte.</p>",
                    guardado.getNombre(), guardado.getEmail(),
                    guardado.getTelefono() != null ? guardado.getTelefono() : "No indicado",
                    guardado.getAsunto(),
                    guardado.getMensaje()
            );
            emailService.enviarHtml("frkisoka@gmail.com", "Mercatto: Nuevo Ticket de Soporte #" + guardado.getId(), cuerpoNotificacion);
        } catch (Exception ignored) {}

        return guardado;
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

            // Enviar respuesta por email al visitante/cliente
            try {
                String cuerpoRespuesta = String.format(
                        "<h3>Respuesta a tu consulta en Mercatto</h3>" +
                        "<p>Hola %s,</p>" +
                        "<p>El equipo de soporte de Mercatto ha respondido a tu consulta:</p>" +
                        "<blockquote style='background:#f1f5f9;padding:12px;border-left:4px solid #4f46e5;'>%s</blockquote>" +
                        "<p><strong>Tu consulta original:</strong></p>" +
                        "<blockquote style='color:#64748b;'>%s</blockquote>" +
                        "<p>Gracias por confiar en <strong>Mercatto</strong>.</p>",
                        ticket.getNombre(), respuestaAdmin, ticket.getMensaje()
                );
                emailService.enviarHtml(ticket.getEmail(), "Respuesta de Soporte Mercatto - Ticket #" + ticket.getId(), cuerpoRespuesta);
            } catch (Exception ignored) {}
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
