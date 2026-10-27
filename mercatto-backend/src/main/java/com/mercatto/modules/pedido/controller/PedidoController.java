package com.mercatto.modules.pedido.controller;

import com.mercatto.dto.request.PedidoRequest;
import com.mercatto.dto.response.PedidoResponse;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.pedido.service.PedidoService;
import com.mercatto.modules.vendedor.service.VendedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired private PedidoService pedidoService;
    @Autowired private VendedorService vendedorService;
    @Autowired private UsuarioRepository usuarioRepo;

    // POST /api/pedidos (Crear pedido desde checkout con usuario autenticado)
    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(
            @Valid @RequestBody PedidoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(201).body(pedidoService.crearPedido(req, usuario));
    }

    // POST /api/pedidos/invitado (Crear pedido sin registro / Guest Checkout)
    @PostMapping("/invitado")
    public ResponseEntity<PedidoResponse> crearPedidoInvitado(
            @Valid @RequestBody PedidoRequest req) {
        return ResponseEntity.status(201).body(pedidoService.crearPedidoInvitado(req));
    }

    // GET /api/pedidos/mis-pedidos (Historial del comprador)
    @GetMapping("/mis-pedidos")
    public ResponseEntity<Page<PedidoResponse>> misPedidos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(pedidoService.listarPorComprador(usuario, pagina, tamano));
    }

    // GET /api/pedidos/rastreo (Publico: Consulta para invitados mediante codigo y email)
    @GetMapping("/rastreo")
    public ResponseEntity<PedidoResponse> rastrearPedido(
            @RequestParam String codigo,
            @RequestParam String email) {
        return ResponseEntity.ok(pedidoService.rastrearPedido(codigo, email));
    }

    // GET /api/pedidos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(pedidoService.obtenerPorId(id, usuario));
    }

    // GET /api/pedidos/vendedor (Pedidos recibidos por la tienda)
    @GetMapping("/vendedor")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'ADMIN')")
    public ResponseEntity<Page<PedidoResponse>> pedidosVendedor(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(pedidoService.listarPorVendedor(vendedor, pagina, tamano));
    }

    // PATCH /api/pedidos/{id}/estado (Actualizar estado de envio / entrega)
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'ADMIN')")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {
        return ResponseEntity.ok(pedidoService.actualizarEstado(
                id, datos.get("estado"), datos.get("guia"), datos.get("empresa")
        ));
    }

    // POST /api/pedidos/{id}/cancelar (Permite al comprador, vendedor o admin cancelar el pedido y revertir stock)
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(pedidoService.cancelarPedido(id, usuario));
    }
}
