package com.mercatto.modules.vendedor.service;

import com.mercatto.modules.pedido.repository.PedidoRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.producto.repository.ResenaRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VendedorServiceTest {

    @Mock private VendedorRepository vendedorRepo;
    @Mock private ProductoRepository productoRepo;
    @Mock private PedidoRepository pedidoRepo;
    @Mock private ResenaRepository resenaRepo;

    @InjectMocks
    private VendedorService vendedorService;

    @Test
    @DisplayName("TC-18: Tasas de Comisión por Plan - Starter 6%, Pro 3%, Elite 1%")
    void testTasasDeComisionPorPlan() {
        assertEquals(0.06, vendedorService.obtenerTasaComision(Vendedor.TipoSuscripcion.STARTER));
        assertEquals(0.03, vendedorService.obtenerTasaComision(Vendedor.TipoSuscripcion.PRO));
        assertEquals(0.01, vendedorService.obtenerTasaComision(Vendedor.TipoSuscripcion.ELITE));
        assertEquals(0.06, vendedorService.obtenerTasaComision(null)); // Fallback a STARTER
    }

    @Test
    @DisplayName("TC-19: Modelo Predictivo de Tienda - Calcula escenarios y comparativa de ahorro")
    @SuppressWarnings("unchecked")
    void testModeloPredictivoTienda() {
        Vendedor v = new Vendedor();
        v.setId(5L);
        v.setNombreTienda("Joyas y Moda");
        v.setTipoSuscripcion(Vendedor.TipoSuscripcion.PRO);

        when(productoRepo.countByVendedor(v)).thenReturn(10L);
        when(pedidoRepo.countByVendedor(v)).thenReturn(5L);
        when(pedidoRepo.sumIngresosByVendedor(v)).thenReturn(500000.0);

        Map<String, Object> modelo = vendedorService.obtenerModeloPredictivo(v);

        assertNotNull(modelo);
        assertEquals("Joyas y Moda", modelo.get("nombreTienda"));
        assertEquals("PRO", modelo.get("planActual"));
        assertEquals(3.0, (Double) modelo.get("porcentajePlanActual"));

        Map<String, Object> escenarios = (Map<String, Object>) modelo.get("escenarios");
        assertNotNull(escenarios);
        assertTrue(escenarios.containsKey("conservador"));
        assertTrue(escenarios.containsKey("esperado"));
        assertTrue(escenarios.containsKey("optimista"));

        Map<String, Object> comparativa = (Map<String, Object>) modelo.get("comparativaPlanes");
        assertNotNull(comparativa);
        assertTrue(comparativa.containsKey("STARTER"));
        assertTrue(comparativa.containsKey("PRO"));
        assertTrue(comparativa.containsKey("ELITE"));
    }
}
