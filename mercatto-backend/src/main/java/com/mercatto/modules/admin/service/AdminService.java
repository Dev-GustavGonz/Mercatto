package com.mercatto.modules.admin.service;

import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.modules.vendedor.service.VendedorService;

import com.mercatto.dto.response.StatsResponse;
import com.mercatto.dto.response.VendedorResponse;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private VendedorService vendedorService;

    public StatsResponse obtenerEstadisticas() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalUsuarios(usuarioRepo.count());
        stats.setTotalVendedores(vendedorRepo.count());
        stats.setTotalVendedoresPendientes(vendedorRepo.countByEstado(Vendedor.Estado.PENDIENTE));
        stats.setTotalProductos(productoRepo.count());
        stats.setTotalPedidos(pedidoRepo.count());
        stats.setIngresosTotales(pedidoRepo.sumIngresosTotales());
        stats.setIngresosMes(pedidoRepo.sumIngresosTotales() * 0.15); // Simulación o cálculo comisiones

        Map<String, Long> porEstado = new HashMap<>();
        stats.setPedidosPorEstado(porEstado);
        return stats;
    }

    public Page<VendedorResponse> listarVendedores(String estadoStr, int pagina, int tamano) {
        Page<Vendedor> page;
        if (estadoStr != null && !estadoStr.isBlank()) {
            Vendedor.Estado estado = Vendedor.Estado.valueOf(estadoStr.toUpperCase());
            page = vendedorRepo.findByEstado(estado, PageRequest.of(pagina, tamano));
        } else {
            page = vendedorRepo.findAll(PageRequest.of(pagina, tamano));
        }
        return page.map(vendedorService::convertirAResponse);
    }

    @Transactional
    public VendedorResponse cambiarEstadoVendedor(Long vendedorId, String nuevoEstadoStr) {
        Vendedor v = vendedorRepo.findById(vendedorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor no encontrado"));

        Vendedor.Estado nuevoEstado = Vendedor.Estado.valueOf(nuevoEstadoStr.toUpperCase());
        v.setEstado(nuevoEstado);

        if (nuevoEstado == Vendedor.Estado.APROBADO) {
            v.getUsuario().setActivo(true);
            usuarioRepo.save(v.getUsuario());
        } else if (nuevoEstado == Vendedor.Estado.SUSPENDIDO || nuevoEstado == Vendedor.Estado.RECHAZADO) {
            v.getUsuario().setActivo(false);
            usuarioRepo.save(v.getUsuario());
        }

        return vendedorService.convertirAResponse(vendedorRepo.save(v));
    }

    public Page<Usuario> listarUsuarios(int pagina, int tamano) {
        return usuarioRepo.findAll(PageRequest.of(pagina, tamano));
    }

    @Transactional
    public Usuario cambiarEstadoUsuario(Long usuarioId, boolean activo) {
        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        u.setActivo(activo);
        return usuarioRepo.save(u);
    }

    @Transactional
    public Usuario cambiarRolUsuario(Long usuarioId, String nuevoRolStr) {
        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        u.setRol(Usuario.Rol.valueOf(nuevoRolStr.toUpperCase()));
        return usuarioRepo.save(u);
    }
}
