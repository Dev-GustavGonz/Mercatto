package com.mercatto.modules.producto.controller;

import com.mercatto.dto.request.ResenaRequest;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.Resena;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.producto.repository.ResenaRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resenas")
public class ResenaController {

    @Autowired private ResenaRepository resenaRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<Page<Resena>> porProducto(
            @PathVariable Long productoId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamano) {
        Producto p = productoRepo.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        return ResponseEntity.ok(resenaRepo.findByProductoOrderByFechaCreacionDesc(p, PageRequest.of(pagina, tamano)));
    }

    @PostMapping
    public ResponseEntity<Resena> crear(
            @Valid @RequestBody ResenaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Producto producto = productoRepo.findById(req.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (resenaRepo.existsByProductoAndUsuario(producto, usuario)) {
            throw new BadRequestException("Ya has valorado este producto");
        }

        Resena resena = new Resena();
        resena.setProducto(producto);
        resena.setUsuario(usuario);
        resena.setCalificacion(req.getCalificacion());
        resena.setTitulo(req.getTitulo());
        resena.setComentario(req.getComentario());

        Resena guardada = resenaRepo.save(resena);

        // Actualizar promedio en producto
        Double promedio = resenaRepo.calcularPromedioCalificacion(producto);
        producto.setCalificacion(promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0);
        producto.setTotalResenas((int) resenaRepo.countByProducto(producto));
        productoRepo.save(producto);

        return ResponseEntity.status(201).body(guardada);
    }
}
