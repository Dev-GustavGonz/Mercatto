package com.mercatto.modules.vendedor.controller;

import com.mercatto.dto.response.ProductoResponse;
import com.mercatto.dto.response.TiendaPublicaResponse;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.service.ProductoService;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.modules.vendedor.service.TiendaPublicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tiendas")
public class TiendaPublicaController {

    @Autowired
    private TiendaPublicaService tiendaPublicaService;

    @Autowired
    private VendedorRepository vendedorRepo;

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<TiendaPublicaResponse>> listarTiendas() {
        return ResponseEntity.ok()
                .header("Cache-Control", "no-cache")
                .body(tiendaPublicaService.listarTiendas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiendaPublicaResponse> obtenerTienda(@PathVariable Long id) {
        return ResponseEntity.ok()
                .header("Cache-Control", "no-cache")
                .body(tiendaPublicaService.obtenerTienda(id));
    }

    @GetMapping("/{id}/productos")
    public ResponseEntity<Page<ProductoResponse>> listarProductosPorTienda(
            @PathVariable Long id,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String marca,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int tamano,
            @RequestParam(defaultValue = "recientes") String orden) {

        // Validar que la tienda exista
        if (!vendedorRepo.existsById(id)) {
            throw new ResourceNotFoundException("Tienda no encontrada");
        }

        Page<ProductoResponse> productos = productoService.filtrarPorTienda(
                id, categoriaId, marca, precioMin, precioMax, q, pagina, tamano, orden);

        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=120, stale-while-revalidate=240")
                .body(productos);
    }

    @GetMapping("/marcas")
    public ResponseEntity<List<String>> listarMarcas() {
        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
                .body(tiendaPublicaService.listarMarcas());
    }
}
