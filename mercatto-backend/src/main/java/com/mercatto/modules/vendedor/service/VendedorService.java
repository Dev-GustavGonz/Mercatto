package com.mercatto.modules.vendedor.service;

import com.mercatto.dto.response.VendedorResponse;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class VendedorService {

    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private PedidoRepository pedidoRepo;

    @Transactional
    public Vendedor obtenerPorUsuario(Usuario usuario) {
        return vendedorRepo.findByUsuario(usuario)
                .orElseGet(() -> {
                    Vendedor nuevo = new Vendedor();
                    nuevo.setUsuario(usuario);
                    String nombre = usuario.getNombre();
                    if (nombre == null || nombre.isBlank()) {
                        nombre = "Tienda de " + (usuario.getEmail() != null ? usuario.getEmail().split("@")[0] : "Vendedor");
                    }
                    nuevo.setNombreTienda(nombre);
                    nuevo.setTipo(Vendedor.Tipo.PERSONA_NATURAL);
                    nuevo.setEstado(Vendedor.Estado.APROBADO);
                    nuevo.setTipoSuscripcion(Vendedor.TipoSuscripcion.STARTER);
                    nuevo.setCalificacion(5.0);
                    nuevo.setTotalVentas(0);
                    nuevo.setCiudad("Cartagena");
                    nuevo.setFechaExpiracionSuscripcion(LocalDateTime.now().plusYears(100));
                    return vendedorRepo.save(nuevo);
                });
    }

    public VendedorResponse obtenerPerfilResponse(Usuario usuario) {
        Vendedor v = obtenerPorUsuario(usuario);
        return convertirAResponse(v);
    }

    @Transactional
    public VendedorResponse actualizarPerfil(Usuario usuario, Map<String, String> datos) {
        Vendedor v = obtenerPorUsuario(usuario);
        if (datos.containsKey("nombreTienda")) v.setNombreTienda(datos.get("nombreTienda"));
        if (datos.containsKey("descripcion")) v.setDescripcion(datos.get("descripcion"));
        if (datos.containsKey("logoUrl")) v.setLogoUrl(datos.get("logoUrl"));
        if (datos.containsKey("portadaUrl")) v.setPortadaUrl(datos.get("portadaUrl"));
        if (datos.containsKey("ciudad")) v.setCiudad(datos.get("ciudad"));
        if (datos.containsKey("direccion")) v.setDireccion(datos.get("direccion"));
        if (datos.containsKey("cuentaBancaria")) v.setCuentaBancaria(datos.get("cuentaBancaria"));
        if (datos.containsKey("banco")) v.setBanco(datos.get("banco"));

        return convertirAResponse(vendedorRepo.save(v));
    }

    @Transactional
    public VendedorResponse actualizarSuscripcion(Usuario usuario, String planStr) {
        Vendedor v = obtenerPorUsuario(usuario);
        Vendedor.TipoSuscripcion nuevoPlan;
        try {
            nuevoPlan = Vendedor.TipoSuscripcion.valueOf(planStr.toUpperCase());
        } catch (Exception e) {
            throw new com.mercatto.exception.BadRequestException("Plan de suscripción no válido: " + planStr);
        }

        v.setTipoSuscripcion(nuevoPlan);
        if (nuevoPlan == Vendedor.TipoSuscripcion.STARTER) {
            v.setFechaExpiracionSuscripcion(LocalDateTime.now().plusYears(100));
        } else {
            // Plan mensual (30 días)
            v.setFechaExpiracionSuscripcion(LocalDateTime.now().plusDays(30));
        }

        return convertirAResponse(vendedorRepo.save(v));
    }

    public double obtenerTasaComision(Vendedor.TipoSuscripcion plan) {
        if (plan == null) return 0.10;
        switch (plan) {
            case PRO: return 0.05;
            case ELITE: return 0.02;
            case STARTER:
            default: return 0.10;
        }
    }

    public double obtenerCuotaMensual(Vendedor.TipoSuscripcion plan) {
        if (plan == null) return 0.0;
        switch (plan) {
            case PRO: return 49000.0;
            case ELITE: return 99000.0;
            case STARTER:
            default: return 0.0;
        }
    }

    public Map<String, Object> obtenerEstadisticas(Vendedor vendedor) {
        Map<String, Object> stats = new HashMap<>();
        Double entregados = pedidoRepo.sumIngresosByVendedor(vendedor);
        double ventasBrutas = entregados != null ? entregados : 0.0;
        Double enCustodia = pedidoRepo.sumIngresosEnCustodiaByVendedor(vendedor);
        double ventasEnCustodia = enCustodia != null ? enCustodia : 0.0;

        // Comisiones y neto congelados por compra (no cambian si la tienda modifica su plan después)
        Double sumComisionCongelada = pedidoRepo.sumComisionByVendedor(vendedor);
        Double sumNetoCongelado = pedidoRepo.sumNetoByVendedor(vendedor);

        double tasaComision = obtenerTasaComision(vendedor.getTipoSuscripcion());
        double comisionMercatto;
        double ingresosNetos;

        if (sumComisionCongelada != null && sumComisionCongelada > 0) {
            comisionMercatto = Math.round(sumComisionCongelada * 100.0) / 100.0;
            ingresosNetos = sumNetoCongelado != null
                    ? Math.round(sumNetoCongelado * 100.0) / 100.0
                    : Math.round((ventasBrutas - comisionMercatto) * 100.0) / 100.0;
        } else {
            comisionMercatto = Math.round(ventasBrutas * tasaComision * 100.0) / 100.0;
            ingresosNetos = Math.round((ventasBrutas - comisionMercatto) * 100.0) / 100.0;
        }

        stats.put("totalProductos", productoRepo.countByVendedor(vendedor));
        stats.put("totalPedidos", pedidoRepo.countByVendedor(vendedor));
        stats.put("ventasBrutas", ventasBrutas);
        stats.put("ventasEnCustodia", ventasEnCustodia);
        stats.put("tasaComision", tasaComision * 100);
        stats.put("comisionMercatto", comisionMercatto);
        stats.put("comisionAdmin", comisionMercatto);
        stats.put("ingresosTotales", ingresosNetos); // Dinero neto distribuido a la tienda tras entrega
        stats.put("calificacion", vendedor.getCalificacion());
        stats.put("totalVentas", vendedor.getTotalVentas());
        stats.put("planActual", vendedor.getTipoSuscripcion() != null ? vendedor.getTipoSuscripcion().name() : "STARTER");
        return stats;
    }

    public Map<String, Object> obtenerModeloPredictivo(Vendedor vendedor) {
        Map<String, Object> modelo = new HashMap<>();
        
        long totalProductos = productoRepo.countByVendedor(vendedor);
        long totalPedidos = pedidoRepo.countByVendedor(vendedor);
        Double ventasHistoricas = pedidoRepo.sumIngresosByVendedor(vendedor);
        if (ventasHistoricas == null) ventasHistoricas = 0.0;
        
        Vendedor.TipoSuscripcion planActual = vendedor.getTipoSuscripcion() != null 
                ? vendedor.getTipoSuscripcion() 
                : Vendedor.TipoSuscripcion.STARTER;
        double tasaActual = obtenerTasaComision(planActual);
        
        // Ticket promedio histórico o estimado por productos
        double ticketPromedio = 85000.0;
        if (totalPedidos > 0 && ventasHistoricas > 0) {
            ticketPromedio = Math.round(ventasHistoricas / totalPedidos);
        } else if (totalProductos > 0) {
            ticketPromedio = 115000.0;
        }

        // Estimación mensual base de compras según tracción de catálogo
        int comprasBase = (int) Math.max(12, totalProductos * 4 + totalPedidos * 2);

        // 1. Escenario Conservador (-25%)
        int comprasConservador = (int) Math.max(5, Math.round(comprasBase * 0.75));
        double valorConservador = comprasConservador * ticketPromedio;
        double comisionConservador = valorConservador * tasaActual;
        double netoConservador = valorConservador - comisionConservador;

        // 2. Escenario Esperado (Base)
        int comprasEsperado = comprasBase;
        double valorEsperado = comprasEsperado * ticketPromedio;
        double comisionEsperado = valorEsperado * tasaActual;
        double netoEsperado = valorEsperado - comisionEsperado;

        // 3. Escenario Optimista (+35%)
        int comprasOptimista = (int) Math.round(comprasBase * 1.35);
        double valorOptimista = comprasOptimista * ticketPromedio;
        double comisionOptimista = valorOptimista * tasaActual;
        double netoOptimista = valorOptimista - comisionOptimista;

        // Comparativa por Planes sobre el volumen Esperado
        double comisionStarter = valorEsperado * 0.10;
        double netoStarter = valorEsperado - comisionStarter;
        
        double comisionPro = valorEsperado * 0.05;
        double netoPro = valorEsperado - comisionPro;
        
        double comisionElite = valorEsperado * 0.02;
        double netoElite = valorEsperado - comisionElite;

        modelo.put("nombreTienda", vendedor.getNombreTienda());
        modelo.put("planActual", planActual.name());
        modelo.put("porcentajePlanActual", tasaActual * 100);
        modelo.put("totalProductos", totalProductos);
        modelo.put("totalPedidosHistoricos", totalPedidos);
        modelo.put("ventasHistoricas", ventasHistoricas);
        modelo.put("ticketPromedio", ticketPromedio);

        // Resultado directo según regla: resultado = valor - porcentaje
        modelo.put("comprasEstimadas", comprasEsperado);
        modelo.put("valorVentasEstimado", valorEsperado);
        modelo.put("comisionEstimada", comisionEsperado);
        modelo.put("gananciaNetaEsperada", netoEsperado);

        Map<String, Object> escenarios = new HashMap<>();
        escenarios.put("conservador", Map.of(
            "compras", comprasConservador,
            "valorVentas", valorConservador,
            "comision", comisionConservador,
            "gananciaNeta", netoConservador
        ));
        escenarios.put("esperado", Map.of(
            "compras", comprasEsperado,
            "valorVentas", valorEsperado,
            "comision", comisionEsperado,
            "gananciaNeta", netoEsperado
        ));
        escenarios.put("optimista", Map.of(
            "compras", comprasOptimista,
            "valorVentas", valorOptimista,
            "comision", comisionOptimista,
            "gananciaNeta", netoOptimista
        ));
        modelo.put("escenarios", escenarios);

        Map<String, Object> comparativaPlanes = new HashMap<>();
        comparativaPlanes.put("STARTER", Map.of(
            "nombre", "Plan Starter",
            "porcentaje", 10.0,
            "comision", comisionStarter,
            "gananciaNeta", netoStarter,
            "ahorroFrenteStarter", 0.0
        ));
        comparativaPlanes.put("PRO", Map.of(
            "nombre", "Plan Profesional",
            "porcentaje", 5.0,
            "comision", comisionPro,
            "gananciaNeta", netoPro,
            "ahorroFrenteStarter", comisionStarter - comisionPro
        ));
        comparativaPlanes.put("ELITE", Map.of(
            "nombre", "Plan Elite Premium",
            "porcentaje", 2.0,
            "comision", comisionElite,
            "gananciaNeta", netoElite,
            "ahorroFrenteStarter", comisionStarter - comisionElite
        ));
        modelo.put("comparativaPlanes", comparativaPlanes);

        return modelo;
    }

    public VendedorResponse convertirAResponse(Vendedor v) {
        VendedorResponse res = new VendedorResponse();
        res.setId(v.getId());
        res.setUsuarioId(v.getUsuario().getId());
        res.setEmail(v.getUsuario().getEmail());
        res.setNombrePropietario(v.getUsuario().getNombre());
        res.setNombreTienda(v.getNombreTienda());
        res.setDescripcion(v.getDescripcion());
        res.setLogoUrl(v.getLogoUrl());
        res.setPortadaUrl(v.getPortadaUrl());
        res.setTipo(v.getTipo().name());
        res.setEstado(v.getEstado().name());
        res.setNitCedula(v.getNitCedula());
        res.setRazonSocial(v.getRazonSocial());
        res.setCiudad(v.getCiudad());
        res.setDireccion(v.getDireccion());
        res.setCalificacion(v.getCalificacion());
        res.setTotalVentas(v.getTotalVentas());
        res.setFechaRegistro(v.getFechaRegistro());
        res.setTipoSuscripcion(v.getTipoSuscripcion() != null ? v.getTipoSuscripcion().name() : "STARTER");
        Double ventasBrutas = pedidoRepo.sumIngresosByVendedor(v);
        if (ventasBrutas == null) ventasBrutas = 0.0;
        double tasaComision = obtenerTasaComision(v.getTipoSuscripcion());
        double comision = Math.round(ventasBrutas * tasaComision * 100.0) / 100.0;
        double neto = Math.round((ventasBrutas - comision) * 100.0) / 100.0;
        res.setPorcentajeComision(tasaComision * 100.0);
        res.setCuotaMensualPlan(obtenerCuotaMensual(v.getTipoSuscripcion()));

        res.setVentasBrutas(ventasBrutas);
        res.setComisionAdmin(comision);
        res.setPagoNetoVendedor(neto);
        res.setIngresosTotales(neto);
        res.setBanco(v.getBanco());
        res.setCuentaBancaria(v.getCuentaBancaria());
        return res;
    }
}
