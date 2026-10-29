package com.mercatto.modules.soporte.controller;

import com.mercatto.modules.pedido.repository.PedidoItemRepository;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class HealthController {

    private static final long START_TIME_MS = System.currentTimeMillis();

    @Autowired(required = false) private ProductoRepository productoRepo;
    @Autowired(required = false) private PedidoItemRepository itemRepo;
    @Autowired(required = false) private VendedorRepository vendedorRepo;

    @GetMapping({"/api/health", "/api/ping"})
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "UP");
        resp.put("service", "mercatto-backend");
        resp.put("timestamp", Instant.now().toString());
        resp.put("uptimeSeconds", (System.currentTimeMillis() - START_TIME_MS) / 1000);
        
        Runtime runtime = Runtime.getRuntime();
        long freeMb = runtime.freeMemory() / (1024 * 1024);
        long totalMb = runtime.totalMemory() / (1024 * 1024);
        resp.put("memory", freeMb + "MB libre de " + totalMb + "MB");

        return ResponseEntity.ok(resp);
    }

    /**
     * Endpoint de diagnóstico y corrección inmediata:
     * Recalcula el campo totalVentas de todos los productos y tiendas basándose exclusivamente
     * en pedidos con estado PAGADO, EN_PREPARACION, ENVIADO o ENTREGADO.
     * Elimina ventas fantasma infladas por pedidos duplicados o no pagados.
     */
    @GetMapping({"/api/test/sincronizar-ventas", "/api/health/sincronizar-ventas"})
    public ResponseEntity<Map<String, Object>> sincronizarVentas() {
        Map<String, Object> respuesta = new LinkedHashMap<>();
        List<Map<String, Object>> detalles = new ArrayList<>();

        if (productoRepo != null && itemRepo != null) {
            for (Producto p : productoRepo.findAll()) {
                Integer ventasReales = itemRepo.sumarVentasPagadasPorProducto(p.getId());
                int real = ventasReales != null ? ventasReales : 0;
                int anterior = p.getTotalVentas() != null ? p.getTotalVentas() : 0;
                
                if (anterior != real) {
                    p.setTotalVentas(real);
                    productoRepo.save(p);
                    Map<String, Object> det = new LinkedHashMap<>();
                    det.put("productoId", p.getId());
                    det.put("titulo", p.getTitulo());
                    det.put("ventasAnteriores", anterior);
                    det.put("ventasRealesPagadas", real);
                    detalles.add(det);
                }
            }
        }

        if (vendedorRepo != null && itemRepo != null) {
            for (Vendedor v : vendedorRepo.findAll()) {
                Integer ventasReales = itemRepo.sumarVentasPagadasPorVendedor(v.getId());
                int real = ventasReales != null ? ventasReales : 0;
                v.setTotalVentas(real);
                vendedorRepo.save(v);
            }
        }

        respuesta.put("exito", true);
        respuesta.put("mensaje", "Ventas recalculadas y sincronizadas exitosamente según pedidos PAGADOS.");
        respuesta.put("totalProductosAjustados", detalles.size());
        respuesta.put("ajustes", detalles);
        return ResponseEntity.ok(respuesta);
    }
}
