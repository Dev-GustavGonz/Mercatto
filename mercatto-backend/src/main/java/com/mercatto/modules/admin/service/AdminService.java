package com.mercatto.modules.admin.service;

import com.mercatto.modules.pedido.repository.CarritoItemRepository;
import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.producto.repository.FavoritoRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.producto.repository.ResenaRepository;
import com.mercatto.modules.usuario.repository.DireccionRepository;
import com.mercatto.modules.usuario.repository.RefreshTokenRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.modules.vendedor.service.VendedorService;

import com.mercatto.dto.response.StatsResponse;
import com.mercatto.dto.response.VendedorResponse;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AdminService {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private VendedorService vendedorService;
    @Autowired private FavoritoRepository favoritoRepo;
    @Autowired private DireccionRepository direccionRepo;
    @Autowired private RefreshTokenRepository refreshTokenRepo;
    @Autowired private CarritoItemRepository carritoItemRepo;
    @Autowired private ResenaRepository resenaRepo;

    public StatsResponse obtenerEstadisticas() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalUsuarios(usuarioRepo.count());
        stats.setTotalVendedores(vendedorRepo.count());
        stats.setTotalVendedoresPendientes(vendedorRepo.countByEstado(Vendedor.Estado.PENDIENTE));
        stats.setTotalProductos(productoRepo.count());
        stats.setTotalPedidos(pedidoRepo.count());

        Double ventasTotales = pedidoRepo.sumIngresosTotales();
        if (ventasTotales == null) ventasTotales = 0.0;
        stats.setIngresosTotales(ventasTotales);

        // Ganancias reales del Administrador calculadas según el plan de cada tienda:
        // 1) Comisiones por venta: STARTER 10%, PRO 5%, ELITE 2%
        // 2) Cuotas de suscripción mensual: STARTER $0, PRO $49.000, ELITE $99.000
        double totalComisiones = 0.0;
        double totalSuscripciones = 0.0;

        List<Vendedor> todosVendedores = vendedorRepo.findAll();
        for (Vendedor v : todosVendedores) {
            Double ventasTienda = pedidoRepo.sumIngresosByVendedor(v);
            if (ventasTienda == null) ventasTienda = 0.0;
            double tasa = vendedorService.obtenerTasaComision(v.getTipoSuscripcion());
            totalComisiones += (ventasTienda * tasa);
            totalSuscripciones += vendedorService.obtenerCuotaMensual(v.getTipoSuscripcion());
        }

        double gananciaPlataforma = Math.round((totalComisiones + totalSuscripciones) * 100.0) / 100.0;
        stats.setIngresosMes(gananciaPlataforma);

        Map<String, Long> porEstado = new HashMap<>();
        stats.setPedidosPorEstado(porEstado);
        return stats;
    }

    public Map<String, Object> obtenerFinanzasYComisiones() {
        Map<String, Object> finanzas = new HashMap<>();

        Double ventasBrutasTotales = pedidoRepo.sumIngresosTotales();
        if (ventasBrutasTotales == null) ventasBrutasTotales = 0.0;

        List<Vendedor> todosVendedores = vendedorRepo.findAll();
        double totalComisionesRetenidas = 0.0;
        double totalIngresosSuscripciones = 0.0;
        double totalNetoVendedores = 0.0;

        long countStarter = 0;
        long countPro = 0;
        long countElite = 0;

        List<Map<String, Object>> liquidaciones = new ArrayList<>();

        for (Vendedor v : todosVendedores) {
            Vendedor.TipoSuscripcion plan = v.getTipoSuscripcion() != null ? v.getTipoSuscripcion() : Vendedor.TipoSuscripcion.STARTER;
            if (plan == Vendedor.TipoSuscripcion.PRO) countPro++;
            else if (plan == Vendedor.TipoSuscripcion.ELITE) countElite++;
            else countStarter++;

            Double ventasTienda = pedidoRepo.sumIngresosByVendedor(v);
            if (ventasTienda == null) ventasTienda = 0.0;

            double tasaComision = vendedorService.obtenerTasaComision(plan);
            double comisionRetenida = Math.round(ventasTienda * tasaComision * 100.0) / 100.0;
            double netoALiquidar = Math.round((ventasTienda - comisionRetenida) * 100.0) / 100.0;
            double cuotaMensual = vendedorService.obtenerCuotaMensual(plan);

            totalComisionesRetenidas += comisionRetenida;
            totalIngresosSuscripciones += cuotaMensual;
            totalNetoVendedores += netoALiquidar;

            Map<String, Object> liq = new HashMap<>();
            liq.put("vendedorId", v.getId());
            liq.put("nombreTienda", v.getNombreTienda());
            liq.put("propietario", v.getUsuario().getNombre());
            liq.put("email", v.getUsuario().getEmail());
            liq.put("plan", plan.name());
            liq.put("porcentajeComision", tasaComision * 100.0);
            liq.put("cuotaMensualPlan", cuotaMensual);
            liq.put("ventasBrutas", ventasTienda);
            liq.put("comisionRetenida", comisionRetenida);
            liq.put("netoALiquidar", netoALiquidar);
            liq.put("banco", v.getBanco() != null ? v.getBanco() : "No especificado");
            liq.put("cuentaBancaria", v.getCuentaBancaria() != null ? v.getCuentaBancaria() : "No registrada");
            liq.put("estado", v.getEstado().name());
            liquidaciones.add(liq);
        }

        double gananciaNetaTotal = Math.round((totalComisionesRetenidas + totalIngresosSuscripciones) * 100.0) / 100.0;

        finanzas.put("ventasBrutasTotales", Math.round(ventasBrutasTotales * 100.0) / 100.0);
        finanzas.put("comisionesTotalesVentas", Math.round(totalComisionesRetenidas * 100.0) / 100.0);
        finanzas.put("ingresosTotalesSuscripciones", Math.round(totalIngresosSuscripciones * 100.0) / 100.0);
        finanzas.put("gananciaNetaPlataforma", gananciaNetaTotal);
        finanzas.put("totalALiquidarVendedores", Math.round(totalNetoVendedores * 100.0) / 100.0);

        Map<String, Long> tiendasPorPlan = new HashMap<>();
        tiendasPorPlan.put("STARTER", countStarter);
        tiendasPorPlan.put("PRO", countPro);
        tiendasPorPlan.put("ELITE", countElite);
        tiendasPorPlan.put("TOTAL", (long) todosVendedores.size());
        finanzas.put("tiendasPorPlan", tiendasPorPlan);

        finanzas.put("liquidaciones", liquidaciones);
        return finanzas;
    }

    public Map<String, Object> obtenerModeloPredictivoAdmin(
            Integer mesParam,
            Integer addStarterParam,
            Integer addProParam,
            Integer addEliteParam,
            Double ticketParam) {

        int mes = (mesParam != null && mesParam >= 1 && mesParam <= 12) ? mesParam : 10;
        int addStarter = (addStarterParam != null) ? Math.max(0, addStarterParam) : 0;
        int addPro = (addProParam != null) ? Math.max(0, addProParam) : 0;
        int addElite = (addEliteParam != null) ? Math.max(0, addEliteParam) : 0;

        List<Vendedor> todosVendedores = vendedorRepo.findAll();
        long realStarter = 0;
        long realPro = 0;
        long realElite = 0;

        for (Vendedor v : todosVendedores) {
            Vendedor.TipoSuscripcion plan = v.getTipoSuscripcion() != null ? v.getTipoSuscripcion() : Vendedor.TipoSuscripcion.STARTER;
            if (plan == Vendedor.TipoSuscripcion.PRO) realPro++;
            else if (plan == Vendedor.TipoSuscripcion.ELITE) realElite++;
            else realStarter++;
        }

        // Si la base de datos está vacía en pruebas, proveer base demostrativa representativa
        if (todosVendedores.isEmpty()) {
            realStarter = 5;
            realPro = 3;
            realElite = 2;
        }

        long totalStarter = realStarter + addStarter;
        long totalPro = realPro + addPro;
        long totalElite = realElite + addElite;
        long totalTiendas = totalStarter + totalPro + totalElite;

        // Ticket promedio del marketplace
        double ticketPromedio = (ticketParam != null && ticketParam > 0) ? ticketParam : 120000.0;
        Double gmvHistorico = pedidoRepo.sumIngresosTotales();
        long totalPedidos = pedidoRepo.count();
        if (ticketParam == null && totalPedidos > 0 && gmvHistorico != null && gmvHistorico > 0) {
            ticketPromedio = Math.round(gmvHistorico / totalPedidos);
        }

        // Inferencia predictiva base de compras y ventas promedio por tienda según su plan
        // Starter: ~16 compras/mes | Pro: ~42 compras/mes | Elite: ~128 compras/mes
        int comprasPorTiendaStarter = (int) Math.max(10, Math.round(16 * (mes >= 11 ? 1.35 : 1.0)));
        int comprasPorTiendaPro = (int) Math.max(25, Math.round(42 * (mes >= 11 ? 1.35 : 1.0)));
        int comprasPorTiendaElite = (int) Math.max(60, Math.round(128 * (mes >= 11 ? 1.35 : 1.0)));

        double ventasUnitariasStarter = comprasPorTiendaStarter * ticketPromedio;
        double ventasUnitariasPro = comprasPorTiendaPro * ticketPromedio;
        double ventasUnitariasElite = comprasPorTiendaElite * ticketPromedio;

        // Proyecciones por categoría de plan
        double gmvStarter = totalStarter * ventasUnitariasStarter;
        double gmvPro = totalPro * ventasUnitariasPro;
        double gmvElite = totalElite * ventasUnitariasElite;

        int pedidosStarter = (int) (totalStarter * comprasPorTiendaStarter);
        int pedidosPro = (int) (totalPro * comprasPorTiendaPro);
        int pedidosElite = (int) (totalElite * comprasPorTiendaElite);

        double comisionStarter = gmvStarter * 0.10; // 10%
        double comisionPro = gmvPro * 0.05;         // 5%
        double comisionElite = gmvElite * 0.02;     // 2%

        double suscripcionStarter = 0.0;
        double suscripcionPro = totalPro * 49000.0;
        double suscripcionElite = totalElite * 99000.0;

        double gmvTotal = gmvStarter + gmvPro + gmvElite;
        int pedidosTotal = pedidosStarter + pedidosPro + pedidosElite;
        double comisionesTotal = comisionStarter + comisionPro + comisionElite;
        double suscripcionesTotal = suscripcionStarter + suscripcionPro + suscripcionElite;
        double gananciaNetaAdmin = comisionesTotal + suscripcionesTotal;
        double aLiquidarTiendas = gmvTotal - comisionesTotal;

        // Escenarios estadísticos: Conservador (-25%), Esperado, Optimista (+35%)
        double gmvConservador = Math.round(gmvTotal * 0.75);
        double comisionesConservador = Math.round(comisionesTotal * 0.75);
        double gananciaConservador = comisionesConservador + suscripcionesTotal;
        double liquidarConservador = gmvConservador - comisionesConservador;

        double gmvOptimista = Math.round(gmvTotal * 1.35);
        double comisionesOptimista = Math.round(comisionesTotal * 1.35);
        double gananciaOptimista = comisionesOptimista + suscripcionesTotal;
        double liquidarOptimista = gmvOptimista - comisionesOptimista;

        Map<String, Object> res = new HashMap<>();
        res.put("mes", mes);
        res.put("ticketPromedio", ticketPromedio);
        res.put("totalTiendas", totalTiendas);
        res.put("formula", "Ganancia Plataforma = Comisiones por Venta (Starter 10%, Pro 5%, Elite 2%) + Suscripciones Mensuales (Pro $49.000, Elite $99.000)");

        // Totales Escenario Esperado (Base ML)
        res.put("ventasTotalesMarketplace", Math.round(gmvTotal));
        res.put("pedidosTotalesMarketplace", pedidosTotal);
        res.put("comisionesTotalesVentas", Math.round(comisionesTotal));
        res.put("ingresosTotalesSuscripciones", Math.round(suscripcionesTotal));
        res.put("gananciaNetaAdmin", Math.round(gananciaNetaAdmin));
        res.put("totalALiquidarTiendas", Math.round(aLiquidarTiendas));
        res.put("margenEfectivoPlataforma", gmvTotal > 0 ? Math.round((gananciaNetaAdmin / gmvTotal) * 10000.0) / 100.0 : 0.0);

        Map<String, Object> desglose = new HashMap<>();
        desglose.put("STARTER", Map.of(
            "nombre", "Plan Starter",
            "tiendas", totalStarter,
            "porcentajeComision", 10.0,
            "cuotaMensual", 0.0,
            "ventasBrutas", Math.round(gmvStarter),
            "pedidos", pedidosStarter,
            "comisiones", Math.round(comisionStarter),
            "suscripciones", Math.round(suscripcionStarter),
            "gananciaTotalPlataforma", Math.round(comisionStarter + suscripcionStarter),
            "aLiquidar", Math.round(gmvStarter - comisionStarter)
        ));
        desglose.put("PRO", Map.of(
            "nombre", "Plan Profesional",
            "tiendas", totalPro,
            "porcentajeComision", 5.0,
            "cuotaMensual", 49000.0,
            "ventasBrutas", Math.round(gmvPro),
            "pedidos", pedidosPro,
            "comisiones", Math.round(comisionPro),
            "suscripciones", Math.round(suscripcionPro),
            "gananciaTotalPlataforma", Math.round(comisionPro + suscripcionPro),
            "aLiquidar", Math.round(gmvPro - comisionPro)
        ));
        desglose.put("ELITE", Map.of(
            "nombre", "Plan Elite Premium",
            "tiendas", totalElite,
            "porcentajeComision", 2.0,
            "cuotaMensual", 99000.0,
            "ventasBrutas", Math.round(gmvElite),
            "pedidos", pedidosElite,
            "comisiones", Math.round(comisionElite),
            "suscripciones", Math.round(suscripcionElite),
            "gananciaTotalPlataforma", Math.round(comisionElite + suscripcionElite),
            "aLiquidar", Math.round(gmvElite - comisionElite)
        ));
        res.put("desglosePorPlan", desglose);

        Map<String, Object> escenarios = new HashMap<>();
        escenarios.put("conservador", Map.of(
            "descripcion", "Baja estacionalidad comercial (-25% en ventas)",
            "ventas", gmvConservador,
            "pedidos", Math.round(pedidosTotal * 0.75),
            "comisiones", comisionesConservador,
            "suscripciones", Math.round(suscripcionesTotal),
            "gananciaAdmin", gananciaConservador,
            "aLiquidar", liquidarConservador
        ));
        escenarios.put("esperado", Map.of(
            "descripcion", "Proyección central estándar del modelo ML",
            "ventas", Math.round(gmvTotal),
            "pedidos", pedidosTotal,
            "comisiones", Math.round(comisionesTotal),
            "suscripciones", Math.round(suscripcionesTotal),
            "gananciaAdmin", Math.round(gananciaNetaAdmin),
            "aLiquidar", Math.round(aLiquidarTiendas)
        ));
        escenarios.put("optimista", Map.of(
            "descripcion", "Temporadas comerciales altas (+35% en ventas)",
            "ventas", gmvOptimista,
            "pedidos", Math.round(pedidosTotal * 1.35),
            "comisiones", comisionesOptimista,
            "suscripciones", Math.round(suscripcionesTotal),
            "gananciaAdmin", gananciaOptimista,
            "aLiquidar", liquidarOptimista
        ));
        res.put("escenarios", escenarios);

        return res;
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

    @Transactional
    public void eliminarUsuario(Long usuarioId) {
        Usuario u = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));

        if (u.getRol() == Usuario.Rol.ADMIN) {
            throw new BadRequestException("No es posible eliminar una cuenta con rol de Administrador");
        }

        // 1. Validar si el usuario tiene pedidos registrados en la cuenta como comprador
        long pedidosComprador = pedidoRepo.countByComprador(u);
        if (pedidosComprador > 0) {
            throw new BadRequestException("No se puede eliminar el usuario porque tiene " + pedidosComprador +
                    " pedido(s) registrado(s) en su historial de compras. Para inhabilitarlo, utilice la opción de Suspender.");
        }

        // 2. Validar si es vendedor y tiene productos o pedidos de venta vinculados
        Optional<Vendedor> vendedorOpt = vendedorRepo.findByUsuario(u);
        if (vendedorOpt.isPresent()) {
            Vendedor v = vendedorOpt.get();
            long totalProductos = productoRepo.countByVendedor(v);
            if (totalProductos > 0) {
                throw new BadRequestException("No se puede eliminar el usuario porque su tienda (" + v.getNombreTienda() +
                        ") tiene " + totalProductos + " producto(s) en su catálogo. Debe retirar sus productos primero o suspenderla.");
            }
            long totalVentas = pedidoRepo.countByVendedor(v);
            if (totalVentas > 0) {
                throw new BadRequestException("No se puede eliminar el usuario porque su tienda (" + v.getNombreTienda() +
                        ") tiene " + totalVentas + " pedido(s) de ventas asociados en la plataforma.");
            }
        }

        // 3. Validar si tiene reseñas activas
        long totalResenas = resenaRepo.countByUsuario(u);
        if (totalResenas > 0) {
            throw new BadRequestException("No se puede eliminar el usuario porque tiene " + totalResenas +
                    " reseña(s) registrada(s) en productos del catálogo.");
        }

        // 4. Si no tiene pedidos ni actividad comercial en la cuenta, limpiar registros auxiliares no transaccionales
        if (vendedorOpt.isPresent()) {
            vendedorRepo.delete(vendedorOpt.get());
        }

        favoritoRepo.deleteByUsuario(u);
        direccionRepo.deleteByUsuario(u);
        refreshTokenRepo.deleteByUsuario(u);
        carritoItemRepo.deleteByUsuario(u);

        // 5. Eliminar usuario de forma segura
        usuarioRepo.delete(u);
    }
}
