package com.mercatto.modules.usuario.controller;

import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.usuario.model.Direccion;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.usuario.repository.DireccionRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/direcciones")
public class DireccionController {

    @Autowired private DireccionRepository direccionRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    @GetMapping
    public ResponseEntity<List<Direccion>> listar(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(direccionRepo.findByUsuario(u));
    }

    @PostMapping
    public ResponseEntity<Direccion> crear(
            @RequestBody Direccion direccion,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        direccion.setUsuario(u);
        return ResponseEntity.status(201).body(direccionRepo.save(direccion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        Direccion dir = direccionRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Dirección no encontrada"));
        if (dir.getUsuario().getId().equals(u.getId())) {
            direccionRepo.delete(dir);
        }
        return ResponseEntity.ok(Map.of("exito", true));
    }
}
