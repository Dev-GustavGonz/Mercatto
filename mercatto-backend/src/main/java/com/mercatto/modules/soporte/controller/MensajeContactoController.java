package com.mercatto.modules.soporte.controller;

import com.mercatto.dto.request.MensajeRequest;
import com.mercatto.modules.soporte.model.MensajeContacto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.soporte.service.MensajeContactoService;
import com.mercatto.modules.vendedor.service.VendedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mensajes")
public class MensajeContactoController {

    @Autowired private MensajeContactoService mensajeService;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private VendedorService vendedorService;

    // POST /api/mensajes/contacto (Enviar mensaje de consulta/negociación al vendedor)
    @PostMapping("/contacto")
    public ResponseEntity<MensajeContacto> enviarMensaje(
            @Valid @RequestBody MensajeRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(201).body(mensajeService.enviarMensaje(req, usuario));
    }

    // GET /api/mensajes/producto/{productoId} (Ver conversación sobre un producto)
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<MensajeContacto>> conversacion(
            @PathVariable Long productoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(mensajeService.obtenerConversacion(usuario, productoId));
    }

    // GET /api/mensajes/bandeja-comprador (Mensajes enviados/recibidos por el comprador)
    @GetMapping("/bandeja-comprador")
    public ResponseEntity<Page<MensajeContacto>> bandejaComprador(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "15") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(mensajeService.bandejaComprador(usuario, pagina, tamano));
    }

    // GET /api/mensajes/bandeja-vendedor (Preguntas de clientes recibidas por la tienda)
    @GetMapping("/bandeja-vendedor")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<Page<MensajeContacto>> bandejaVendedor(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "15") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(mensajeService.bandejaVendedor(vendedor, pagina, tamano));
    }

    // PATCH /api/mensajes/{id}/leido
    @PatchMapping("/{id}/leido")
    public ResponseEntity<?> marcarLeido(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        mensajeService.marcarLeido(id, usuario);
        return ResponseEntity.ok(Map.of("exito", true));
    }

    // GET /api/mensajes/no-leidos
    @GetMapping("/no-leidos")
    public ResponseEntity<?> noLeidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of("noLeidos", mensajeService.contarNoLeidos(usuario)));
    }
}
