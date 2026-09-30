package com.mercatto.controller;

import com.mercatto.model.Usuario;
import com.mercatto.repository.UsuarioRepository;
import com.mercatto.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Autowired private PagoService pagoService;
    @Autowired private UsuarioRepository usuarioRepo;

    // POST /api/pagos/iniciar
    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarPago(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Long pedidoId = Long.valueOf(req.get("pedidoId").toString());
        String metodo = req.getOrDefault("metodo", "STRIPE").toString();

        Map<String, Object> res = pagoService.iniciarPago(pedidoId, metodo, usuario);
        return ResponseEntity.ok(res);
    }

    // POST /api/pagos/confirmar
    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarPago(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Long pedidoId = Long.valueOf(req.get("pedidoId").toString());
        String transaccionId = (String) req.get("transaccionId");

        Map<String, Object> res = pagoService.confirmarPago(pedidoId, transaccionId, usuario);
        return ResponseEntity.ok(res);
    }

    // POST /api/pagos/webhook/wompi (Público para eventos de Wompi)
    @PostMapping("/webhook/wompi")
    public ResponseEntity<?> webhookWompi(@RequestBody Map<String, Object> evento) {
        boolean procesado = pagoService.procesarWebhookWompi(evento);
        return ResponseEntity.ok(Map.of("received", true, "processed", procesado));
    }
}
