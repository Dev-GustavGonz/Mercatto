package com.mercatto.modules.vendedor.service;

import com.mercatto.config.CacheConfig;
import com.mercatto.dto.response.TiendaPublicaResponse;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.producto.repository.ResenaRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TiendaPublicaService {

    @Autowired
    private VendedorRepository vendedorRepo;

    @Autowired
    private ProductoRepository productoRepo;

    @Autowired
    private ResenaRepository resenaRepo;

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_TIENDAS_PUBLICAS, key = "'todas'")
    public List<TiendaPublicaResponse> listarTiendas() {
        List<Vendedor> vendedores = vendedorRepo.findAll().stream()
                .filter(v -> v.getEstado() != Vendedor.Estado.SUSPENDIDO && v.getEstado() != Vendedor.Estado.RECHAZADO)
                .collect(Collectors.toList());
        return vendedores.stream()
                .map(this::convertirATiendaResponse)
                .sorted((a, b) -> {
                    int pesoA = pesoPlan(a.getTipoSuscripcion());
                    int pesoB = pesoPlan(b.getTipoSuscripcion());
                    if (pesoB != pesoA) return Integer.compare(pesoB, pesoA);
                    int califComp = Double.compare(b.getCalificacion() != null ? b.getCalificacion() : 0.0,
                                                   a.getCalificacion() != null ? a.getCalificacion() : 0.0);
                    if (califComp != 0) return califComp;
                    return Integer.compare(b.getTotalVentas() != null ? b.getTotalVentas() : 0,
                                           a.getTotalVentas() != null ? a.getTotalVentas() : 0);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_TIENDA_DETALLE, key = "#id")
    public TiendaPublicaResponse obtenerTienda(Long id) {
        Vendedor vendedor = vendedorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tienda no encontrada"));

        if (vendedor.getEstado() == Vendedor.Estado.SUSPENDIDO || vendedor.getEstado() == Vendedor.Estado.RECHAZADO) {
            throw new ResourceNotFoundException("La tienda no se encuentra disponible");
        }

        return convertirATiendaResponse(vendedor);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.CACHE_MARCAS_PUBLICAS, key = "'todas'")
    public List<String> listarMarcas() {
        return productoRepo.obtenerTodasLasMarcas();
    }

    @CacheEvict(value = {CacheConfig.CACHE_TIENDAS_PUBLICAS, CacheConfig.CACHE_TIENDA_DETALLE, CacheConfig.CACHE_MARCAS_PUBLICAS}, allEntries = true)
    public void limpiarCacheTiendas() {
        // Método de utilidad para invalidar caché de tiendas
    }

    public TiendaPublicaResponse convertirATiendaResponse(Vendedor v) {
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

        // La calificación de la tienda es el promedio de las reseñas de todos sus artículos
        Double promResenas = resenaRepo.calcularPromedioCalificacionVendedor(v);
        if (promResenas == null || promResenas == 0.0) {
            promResenas = productoRepo.calcularPromedioCalificacionArticulos(v);
        }
        double califTienda = (promResenas != null && promResenas > 0.0)
                ? Math.round(promResenas * 10.0) / 10.0
                : (v.getCalificacion() != null && v.getCalificacion() > 0 ? v.getCalificacion() : 5.0);
        res.setCalificacion(califTienda);

        Long totalRes = resenaRepo.countByVendedor(v);
        if (totalRes == null || totalRes == 0) {
            totalRes = productoRepo.sumTotalResenasArticulos(v);
        }
        res.setTotalResenas(totalRes != null ? totalRes.intValue() : 0);

        res.setTotalVentas(v.getTotalVentas() != null ? v.getTotalVentas() : 0);
        res.setTipoSuscripcion(v.getTipoSuscripcion() != null ? v.getTipoSuscripcion().name() : "STARTER");

        // Datos dinámicos de catálogo y marcas
        res.setTotalProductos(productoRepo.countByVendedorAndActivoTrue(v));
        res.setMarcas(productoRepo.obtenerMarcasPorVendedor(v.getId()));

        return res;
    }

    private int pesoPlan(String plan) {
        if (plan == null) return 1;
        return switch (plan.toUpperCase()) {
            case "ELITE" -> 3;
            case "PRO" -> 2;
            default -> 1;
        };
    }
}
