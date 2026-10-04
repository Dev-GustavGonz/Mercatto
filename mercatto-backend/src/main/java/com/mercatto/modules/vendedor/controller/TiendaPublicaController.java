package com.mercatto.modules.vendedor.controller;

import com.mercatto.dto.response.ProductoResponse;
import com.mercatto.dto.response.TiendaPublicaResponse;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.modules.producto.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tiendas")
public class TiendaPublicaController {

    @Autowired
    private VendedorRepository vendedorRepo;

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<TiendaPublicaResponse>> listarTiendas() {
        List<Vendedor> vendedores = vendedorRepo.findByEstado(Vendedor.Estado.APROBADO);
        List<TiendaPublicaResponse> tiendas = vendedores.stream()
                .map(this::convertirATiendaResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tiendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TiendaPublicaResponse> obtenerTienda(@PathVariable Long id) {
        Vendedor vendedor = vendedorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tienda no encontrada"));

        if (vendedor.getEstado() != Vendedor.Estado.APROBADO) {
            throw new ResourceNotFoundException("La tienda no se encuentra disponible");
        }

        return ResponseEntity.ok(convertirATiendaResponse(vendedor));
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

        return ResponseEntity.ok(productos);
    }

    @GetMapping("/marcas")
    public ResponseEntity<List<String>> listarMarcas() {
        List<String> marcas = productoRepo.obtenerTodasLasMarcas();
        return ResponseEntity.ok(marcas);
    }

    private TiendaPublicaResponse convertirATiendaResponse(Vendedor v) {
        TiendaPublicaResponse res = new TiendaPublicaResponse();
        res.setId(v.getId());
        if (v.getUsuario() != null) {
            res.setUsuarioId(v.getUsuario().getId());
        }
        res.setNombreTienda(v.getNombreTienda());
        res.setDescripcion(v.getDescripcion());
        res.setLogoUrl(v.getLogoUrl());
        res.setPortadaUrl(v.getPortadaUrl());
        res.setCiudad(v.getCiudad());
        res.setCalificacion(v.getCalificacion() != null ? v.getCalificacion() : 0.0);
        res.setTotalVentas(v.getTotalVentas() != null ? v.getTotalVentas() : 0);
        res.setTipoSuscripcion(v.getTipoSuscripcion() != null ? v.getTipoSuscripcion().name() : "STARTER");

        // Datos dinámicos de catálogo y marcas
        res.setTotalProductos(productoRepo.countByVendedorAndActivoTrue(v));
        res.setMarcas(productoRepo.obtenerMarcasPorVendedor(v.getId()));

        return res;
    }
}
