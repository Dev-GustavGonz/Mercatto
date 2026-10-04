package com.mercatto.modules.pedido.controller;

import com.mercatto.dto.request.CuponRequest;
import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.service.CuponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    @Autowired private CuponService cuponService;

    // GET /api/cupones (Solo Admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Cupon>> listar() {
        return ResponseEntity.ok(cuponService.listarTodos());
    }

    // POST /api/cupones/validar (Público / Comprador para aplicar al carrito)
    @PostMapping("/validar")
    public ResponseEntity<?> validar(@RequestBody Map<String, Object> body) {
        String codigo = (String) body.get("codigo");
        Double subtotal = Double.valueOf(body.get("subtotal").toString());
        Cupon cupon = cuponService.validarCupon(codigo, subtotal);
        double descuento = cupon.calcularDescuento(subtotal);

        return ResponseEntity.ok(Map.of(
                "exito", true,
                "codigo", cupon.getCodigo(),
                "tipo", cupon.getTipo().name(),
                "valor", cupon.getValor(),
                "descuento", descuento
        ));
    }

    // POST /api/cupones (Solo Admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Cupon> crear(@Valid @RequestBody CuponRequest req) {
        return ResponseEntity.status(201).body(cuponService.crear(req));
    }

    // DELETE /api/cupones/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        cuponService.eliminar(id);
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Cupón eliminado"));
    }
}
