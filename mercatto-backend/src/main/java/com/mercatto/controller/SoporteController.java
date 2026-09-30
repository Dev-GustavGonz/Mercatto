package com.mercatto.controller;

import com.mercatto.dto.request.TicketSoporteRequest;
import com.mercatto.model.TicketSoporte;
import com.mercatto.service.SoporteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/soporte")
public class SoporteController {

    @Autowired
    private SoporteService soporteService;

    // POST /api/soporte/ticket (Ruta pública: cualquier visitante o usuario no registrado puede enviar su ticket)
    @PostMapping("/ticket")
    public ResponseEntity<TicketSoporte> crearTicket(@Valid @RequestBody TicketSoporteRequest req) {
        return ResponseEntity.status(201).body(soporteService.crearTicket(req));
    }

    // GET /api/soporte/admin/tickets (Solo ADMIN)
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TicketSoporte>> listarTickets(
            @RequestParam(required = false) TicketSoporte.EstadoTicket estado,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return ResponseEntity.ok(soporteService.listarTickets(estado, pagina, tamano));
    }

    // PATCH /api/soporte/admin/tickets/{id}/responder (Solo ADMIN)
    @PatchMapping("/admin/tickets/{id}/responder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketSoporte> responderTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String respuesta = body.get("respuesta");
        String estadoStr = body.get("estado");
        TicketSoporte.EstadoTicket estado = null;
        if (estadoStr != null && !estadoStr.isBlank()) {
            try {
                estado = TicketSoporte.EstadoTicket.valueOf(estadoStr.toUpperCase());
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(soporteService.responderTicket(id, respuesta, estado));
    }

    // GET /api/soporte/admin/pendientes-count (Solo ADMIN)
    @GetMapping("/admin/pendientes-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> contarPendientes() {
        return ResponseEntity.ok(Map.of("pendientes", soporteService.contarPendientes()));
    }
}
