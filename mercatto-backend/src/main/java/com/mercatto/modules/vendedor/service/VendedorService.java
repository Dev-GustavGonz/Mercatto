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

    public Vendedor obtenerPorUsuario(Usuario usuario) {
        return vendedorRepo.findByUsuario(usuario)
                .orElseThrow(() -> new ResourceNotFoundException("No tienes un perfil de vendedor activo"));
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

    public Map<String, Object> obtenerEstadisticas(Vendedor vendedor) {
        Map<String, Object> stats = new HashMap<>();
        double ventasBrutas = pedidoRepo.sumIngresosByVendedor(vendedor) != null ? pedidoRepo.sumIngresosByVendedor(vendedor) : 0.0;
        double comisionAdmin = ventasBrutas * 0.04;
        double ingresosNetos = ventasBrutas * 0.96;

        stats.put("totalProductos", productoRepo.countByVendedor(vendedor));
        stats.put("totalPedidos", pedidoRepo.countByVendedor(vendedor));
        stats.put("ventasBrutas", ventasBrutas);
        stats.put("comisionAdmin", comisionAdmin);
        stats.put("ingresosTotales", ingresosNetos); // Dinero neto que le llega al vendedor tras el 4%
        stats.put("calificacion", vendedor.getCalificacion());
        stats.put("totalVentas", vendedor.getTotalVentas());
        return stats;
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
        double comision = ventasBrutas * 0.04;
        double neto = ventasBrutas * 0.96;

        res.setVentasBrutas(ventasBrutas);
        res.setComisionAdmin(comision);
        res.setPagoNetoVendedor(neto);
        res.setIngresosTotales(neto);
        res.setBanco(v.getBanco());
        res.setCuentaBancaria(v.getCuentaBancaria());
        return res;
    }
}
