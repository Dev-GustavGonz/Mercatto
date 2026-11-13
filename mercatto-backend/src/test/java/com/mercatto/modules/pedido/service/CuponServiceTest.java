package com.mercatto.modules.pedido.service;

import com.mercatto.dto.request.CuponRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.repository.CuponRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CuponServiceTest {

    @Mock private CuponRepository cuponRepo;

    @InjectMocks
    private CuponService cuponService;

    @Test
    @DisplayName("TC-13: Validación Exitosa de Cupón Porcentaje")
    void testValidarCuponPorcentaje() {
        Cupon cupon = new Cupon();
        cupon.setCodigo("MERCATTO10");
        cupon.setTipo(Cupon.TipoCupon.PORCENTAJE);
        cupon.setValor(10.0);
        cupon.setMontoMinimo(30000.0);
        cupon.setDescuentoMaximo(50000.0);
        cupon.setActivo(true);

        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("MERCATTO10")).thenReturn(Optional.of(cupon));

        Cupon resultado = cuponService.validarCupon("MERCATTO10", 100000.0);
        assertNotNull(resultado);
        assertEquals(10000.0, resultado.calcularDescuento(100000.0));
    }

    @Test
    @DisplayName("TC-14: Validación Exitosa de Cupón Monto Fijo")
    void testValidarCuponFijo() {
        Cupon cupon = new Cupon();
        cupon.setCodigo("BIENVENIDA");
        cupon.setTipo(Cupon.TipoCupon.MONTO_FIJO);
        cupon.setValor(20000.0);
        cupon.setMontoMinimo(100000.0);
        cupon.setActivo(true);

        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("BIENVENIDA")).thenReturn(Optional.of(cupon));

        Cupon resultado = cuponService.validarCupon("BIENVENIDA", 120000.0);
        assertNotNull(resultado);
        assertEquals(20000.0, resultado.calcularDescuento(120000.0));
    }

    @Test
    @DisplayName("TC-15: Monto Mínimo No Alcanzado - Lanza BadRequestException")
    void testValidarCuponMontoInsuficiente() {
        Cupon cupon = new Cupon();
        cupon.setCodigo("BIENVENIDA");
        cupon.setMontoMinimo(100000.0);
        cupon.setActivo(true);

        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("BIENVENIDA")).thenReturn(Optional.of(cupon));

        assertThrows(BadRequestException.class, () -> {
            cuponService.validarCupon("BIENVENIDA", 50000.0);
        });
    }

    @Test
    @DisplayName("TC-16: Cupón Inexistente o Inactivo - Lanza ResourceNotFoundException")
    void testValidarCuponInexistente() {
        when(cuponRepo.findByCodigoIgnoreCaseAndActivoTrue("FANTASMA")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            cuponService.validarCupon("FANTASMA", 50000.0);
        });
    }

    @Test
    @DisplayName("TC-17: Creación de Cupón Duplicado - Lanza BadRequestException")
    void testCrearCuponDuplicado() {
        CuponRequest req = new CuponRequest();
        req.setCodigo("MERCATTO10");

        when(cuponRepo.existsByCodigoIgnoreCase("MERCATTO10")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> {
            cuponService.crear(req);
        });

        verify(cuponRepo, never()).save(any());
    }
}
