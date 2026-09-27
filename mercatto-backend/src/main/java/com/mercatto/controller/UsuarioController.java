package com.mercatto.controller;

import com.mercatto.model.Usuario;
import com.mercatto.repository.UsuarioRepository;
import com.mercatto.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private CloudinaryService cloudinaryService;
    @Autowired private PasswordEncoder passwordEncoder;

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<?> actualizarPerfil(
            @RequestBody Map<String, String> datos,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        
        if (datos.containsKey("nombre")) {
            u.setNombre(datos.get("nombre"));
        }
        if (datos.containsKey("telefono")) {
            u.setTelefono(datos.get("telefono"));
        }
        
        usuarioRepo.save(u);
        return ResponseEntity.ok(Map.of(
            "exito", true,
            "mensaje", "Perfil actualizado correctamente",
            "usuario", mapUsuario(u)
        ));
    }

    @PostMapping("/me/foto")
    @Transactional
    public ResponseEntity<?> subirFotoPerfil(
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        
        Map<String, Object> resultado = cloudinaryService.subirImagen(archivo);
        String url = (String) resultado.get("url");
        
        u.setFotoPerfil(url);
        usuarioRepo.save(u);
        
        return ResponseEntity.ok(Map.of(
            "exito", true,
            "mensaje", "Foto de perfil actualizada",
            "usuario", mapUsuario(u)
        ));
    }

    @PutMapping("/me/password")
    @Transactional
    public ResponseEntity<?> cambiarPassword(
            @RequestBody Map<String, String> datos,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        
        // Si el usuario se registró con Google y no tiene password, no pedimos passwordActual
        if (u.getPassword() != null) {
            String passwordActual = datos.get("passwordActual");
            if (passwordActual == null || !passwordEncoder.matches(passwordActual, u.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "exito", false,
                    "mensaje", "La contraseña actual es incorrecta"
                ));
            }
        }
        
        String nuevaPassword = datos.get("nuevaPassword");
        if (nuevaPassword == null || nuevaPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of(
                "exito", false,
                "mensaje", "La nueva contraseña debe tener al menos 6 caracteres"
            ));
        }

        u.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepo.save(u);

        return ResponseEntity.ok(Map.of(
            "exito", true,
            "mensaje", "Contraseña actualizada correctamente"
        ));
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> eliminarCuenta(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario u = usuarioRepo.findByEmail(userDetails.getUsername()).orElseThrow();
        // Borrado lógico para no romper dependencias de FK
        u.setActivo(false);
        usuarioRepo.save(u);

        return ResponseEntity.ok(Map.of(
            "exito", true,
            "mensaje", "Cuenta eliminada correctamente"
        ));
    }

    private Map<String, Object> mapUsuario(Usuario u) {
        return Map.of(
            "id", u.getId(),
            "nombre", u.getNombre(),
            "email", u.getEmail(),
            "rol", u.getRol().name(),
            "telefono", u.getTelefono() != null ? u.getTelefono() : "",
            "fotoPerfil", u.getFotoPerfil() != null ? u.getFotoPerfil() : "",
            "tokensChat", u.getTokensChat() != null ? u.getTokensChat() : 0
        );
    }
}
