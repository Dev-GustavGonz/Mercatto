package com.mercatto.modules.producto.controller;

import com.mercatto.modules.producto.model.Categoria;
import com.mercatto.modules.producto.service.CategoriaService;
import com.mercatto.util.LocalizationUtil;
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
        List<Categoria> categorias = categoriaService.listarPrincipales();
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
                .body(LocalizationUtil.clonarYTraducirListaCategorias(categorias, LocalizationUtil.isEnglishRequest()));
    }

    // GET /api/categorias/todas
    @GetMapping("/todas")
    public ResponseEntity<List<Categoria>> listarTodas() {
        List<Categoria> categorias = categoriaService.listarTodas();
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
                .body(LocalizationUtil.clonarYTraducirListaCategorias(categorias, LocalizationUtil.isEnglishRequest()));
    }

    // GET /api/categorias/{slug}
    @GetMapping("/{slug}")
    public ResponseEntity<Categoria> obtenerPorSlug(@PathVariable String slug) {
        Categoria cat = categoriaService.obtenerPorSlug(slug);
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
                .body(LocalizationUtil.clonarYTraducirCategoria(cat, LocalizationUtil.isEnglishRequest()));
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
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", LocalizationUtil.msg("Categoría eliminada", "Category deleted")));
    }
}
