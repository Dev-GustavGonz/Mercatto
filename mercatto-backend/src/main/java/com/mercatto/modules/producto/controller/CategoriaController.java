package com.mercatto.modules.producto.controller;

import com.mercatto.modules.producto.model.Categoria;
import com.mercatto.modules.producto.service.CategoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService categoriaService;

    // GET /api/categorias (Listar jerarquía pública)
    @GetMapping
    public ResponseEntity<List<Categoria>> listarPrincipales() {
        return ResponseEntity.ok(categoriaService.listarPrincipales());
    }

    // GET /api/categorias/todas
    @GetMapping("/todas")
    public ResponseEntity<List<Categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    // GET /api/categorias/{slug}
    @GetMapping("/{slug}")
    public ResponseEntity<Categoria> obtenerPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoriaService.obtenerPorSlug(slug));
    }

    // POST /api/categorias (Solo Admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> crear(
            @RequestBody Categoria categoria,
            @RequestParam(required = false) Long padreId) {
        return ResponseEntity.status(201).body(categoriaService.crear(categoria, padreId));
    }

    // PUT /api/categorias/{id} (Solo Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Categoria> actualizar(
            @PathVariable Long id,
            @RequestBody Categoria categoria,
            @RequestParam(required = false) Long padreId) {
        return ResponseEntity.ok(categoriaService.actualizar(id, categoria, padreId));
    }

    // DELETE /api/categorias/{id} (Solo Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Categoría eliminada"));
    }
}
