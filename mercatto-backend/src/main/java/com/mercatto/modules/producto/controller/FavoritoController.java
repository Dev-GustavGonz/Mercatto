package com.mercatto.modules.producto.controller;

import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.model.Favorito;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.producto.repository.FavoritoRepository;
import com.mercatto.modules.producto.repository.ProductoRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    @Autowired private FavoritoRepository favoritoRepo;
    @Autowired private ProductoRepository productoRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    @GetMapping
    public ResponseEntity<Page<Favorito>> listar(
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int tamano,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(favoritoRepo.findByUsuarioOrderByFechaAgregadoDesc(u, PageRequest.of(pagina, tamano)));
    }

    @PostMapping("/{productoId}")
    @Transactional
    public ResponseEntity<?> toggle(
            @PathVariable Long productoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Producto p = productoRepo.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (favoritoRepo.existsByUsuarioAndProducto(u, p)) {
            favoritoRepo.deleteByUsuarioAndProducto(u, p);
            return ResponseEntity.ok(Map.of("favorito", false, "mensaje", "Eliminado de favoritos"));
        } else {
            Favorito f = new Favorito();
            f.setUsuario(u);
            f.setProducto(p);
            favoritoRepo.save(f);
            return ResponseEntity.ok(Map.of("favorito", true, "mensaje", "Agregado a favoritos"));
        }
    }
}
