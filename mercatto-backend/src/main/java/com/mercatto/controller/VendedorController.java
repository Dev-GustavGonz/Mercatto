package com.mercatto.controller;

import com.mercatto.dto.response.VendedorResponse;
import com.mercatto.model.Usuario;
import com.mercatto.model.Vendedor;
import com.mercatto.repository.UsuarioRepository;
import com.mercatto.service.VendedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendedor")
@PreAuthorize("hasRole('VENDEDOR')")
public class VendedorController {

    @Autowired private VendedorService vendedorService;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private com.mercatto.service.ProductoService productoService;

    // GET /api/vendedor/perfil
    @GetMapping("/perfil")
    public ResponseEntity<VendedorResponse> perfil(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(vendedorService.obtenerPerfilResponse(usuario));
    }

    // PUT /api/vendedor/perfil
    @PutMapping("/perfil")
    public ResponseEntity<VendedorResponse> actualizarPerfil(
            @RequestBody Map<String, String> datos,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(vendedorService.actualizarPerfil(usuario, datos));
    }

    // POST /api/vendedor/suscripcion
    @PostMapping("/suscripcion")
    public ResponseEntity<VendedorResponse> actualizarSuscripcion(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        String plan = body.getOrDefault("plan", "STARTER");
        return ResponseEntity.ok(vendedorService.actualizarSuscripcion(usuario, plan));
    }

    // GET /api/vendedor/stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(vendedorService.obtenerEstadisticas(vendedor));
    }

    // GET /api/vendedor/productos (Productos exclusivos del vendedor autenticado)
    @GetMapping("/productos")
    public ResponseEntity<org.springframework.data.domain.Page<com.mercatto.dto.response.ProductoResponse>> misProductos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "50") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(productoService.listarPorVendedor(vendedor, pagina, tamano));
    }
}
