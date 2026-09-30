package com.mercatto.controller;

import com.mercatto.dto.response.StatsResponse;
import com.mercatto.dto.response.VendedorResponse;
import com.mercatto.model.Usuario;
import com.mercatto.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private AdminService adminService;

    // GET /api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> stats() {
        return ResponseEntity.ok(adminService.obtenerEstadisticas());
    }

    // GET /api/admin/vendedores
    @GetMapping("/vendedores")
    public ResponseEntity<Page<VendedorResponse>> vendedores(
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "15") int tamano) {
        return ResponseEntity.ok(adminService.listarVendedores(estado, pagina, tamano));
    }

    // PATCH /api/admin/vendedores/{id}/estado (Aprobar o rechazar tienda)
    @PatchMapping("/vendedores/{id}/estado")
    public ResponseEntity<VendedorResponse> cambiarEstadoVendedor(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.cambiarEstadoVendedor(id, body.get("estado")));
    }

    // GET /api/admin/usuarios
    @GetMapping("/usuarios")
    public ResponseEntity<Page<Usuario>> usuarios(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return ResponseEntity.ok(adminService.listarUsuarios(pagina, tamano));
    }

    // PATCH /api/admin/usuarios/{id}/estado
    @PatchMapping("/usuarios/{id}/estado")
    public ResponseEntity<Usuario> cambiarEstadoUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(adminService.cambiarEstadoUsuario(id, body.get("activo")));
    }

    // PATCH /api/admin/usuarios/{id}/rol
    @PatchMapping("/usuarios/{id}/rol")
    public ResponseEntity<Usuario> cambiarRolUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.cambiarRolUsuario(id, body.get("rol")));
    }

    @Autowired private com.mercatto.service.PedidoService pedidoService;

    // GET /api/admin/pedidos (Auditoría de todos los pedidos del marketplace)
    @GetMapping("/pedidos")
    public ResponseEntity<Page<com.mercatto.dto.response.PedidoResponse>> pedidos(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return ResponseEntity.ok(pedidoService.listarTodos(pagina, tamano));
    }
}
