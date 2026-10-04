package com.mercatto.modules.producto.controller;

import com.mercatto.modules.producto.model.Producto;

import com.mercatto.dto.request.ProductoRequest;
import com.mercatto.dto.response.ProductoResponse;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.producto.service.CloudinaryService;
import com.mercatto.modules.producto.service.ProductoService;
import com.mercatto.modules.vendedor.service.VendedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired private ProductoService productoService;
    @Autowired private VendedorService vendedorService;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private CloudinaryService cloudinaryService;

    // GET /api/productos (Catálogo público con filtros)
    @GetMapping
    public ResponseEntity<Page<ProductoResponse>> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String marca,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int tamano,
            @RequestParam(defaultValue = "recientes") String orden) {
        return ResponseEntity.ok(productoService.listar(categoriaId, marca, precioMin, precioMax, q, pagina, tamano, orden));
    }

    // GET /api/productos/destacados
    @GetMapping("/destacados")
    public ResponseEntity<List<ProductoResponse>> destacados() {
        return ResponseEntity.ok(productoService.obtenerDestacados());
    }

    // GET /api/productos/nuevos
    @GetMapping("/nuevos")
    public ResponseEntity<List<ProductoResponse>> nuevos() {
        return ResponseEntity.ok(productoService.obtenerNuevos());
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    // GET /api/productos/slug/{slug}
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductoResponse> obtenerPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(productoService.obtenerPorSlug(slug));
    }

    // POST /api/productos (Solo Vendedor)
    @PostMapping
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductoResponse> crear(
            @Valid @RequestBody ProductoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.status(201).body(productoService.crear(req, vendedor));
    }

    // PUT /api/productos/{id} (Solo Vendedor)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(productoService.actualizar(id, req, vendedor));
    }

    // DELETE /api/productos/{id} (Solo Vendedor o Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'ADMIN')")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        productoService.eliminar(id, vendedor);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Producto eliminado exitosamente"));
    }

    // PATCH /api/productos/{id}/toggle-activo (Pausar o Activar producto)
    @PatchMapping("/{id}/toggle-activo")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<ProductoResponse> toggleActivo(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Vendedor vendedor = vendedorService.obtenerPorUsuario(usuario);
        return ResponseEntity.ok(productoService.toggleActivo(id, vendedor));
    }

    // POST /api/productos/subir-imagen (Subida a Cloudinary / Local)
    @PostMapping("/subir-imagen")
    @PreAuthorize("hasRole('VENDEDOR')")
    public ResponseEntity<?> subirImagen(@RequestParam("archivo") MultipartFile archivo) {
        try {
            Map<String, Object> res = cloudinaryService.subirImagen(archivo);
            return ResponseEntity.ok(res);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al subir la imagen: " + e.getMessage()));
        }
    }
}
