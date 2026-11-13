package com.mercatto.modules.usuario.service;

import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.usuario.repository.RefreshTokenRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;
import com.mercatto.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UsuarioRepository usuarioRepo;
    @Mock private VendedorRepository vendedorRepo;
    @Mock private RefreshTokenRepository refreshRepo;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private GoogleTokenService googleTokenService;

    @InjectMocks
    private AuthService authService;

    private Usuario comprador;

    @BeforeEach
    void setUp() {
        comprador = new Usuario();
        comprador.setId(1L);
        comprador.setEmail("carlos@mercatto.com");
        comprador.setNombre("Carlos Comprador");
        comprador.setPassword("$2a$10$hashedpassword");
        comprador.setRol(Usuario.Rol.COMPRADOR);
        comprador.setActivo(true);
    }

    @Test
    @DisplayName("TC-08: Registro de Comprador Exitoso - Crea usuario y genera tokens")
    void testRegistroCompradorExitoso() {
        Map<String, Object> datos = new HashMap<>();
        datos.put("email", "nuevo@mercatto.com");
        datos.put("nombre", "Nuevo Usuario");
        datos.put("password", "Pass1234*");
        datos.put("rol", "COMPRADOR");

        when(usuarioRepo.existsByEmail("nuevo@mercatto.com")).thenReturn(false);
        when(passwordEncoder.encode("Pass1234*")).thenReturn("encodedPassword");
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(jwtUtil.generarAccessToken(anyString(), anyString())).thenReturn("mock-access-token");
        when(jwtUtil.generarRefreshToken(anyString())).thenReturn("mock-refresh-token");

        Map<String, Object> res = authService.registrar(datos);

        assertTrue((Boolean) res.get("exito"));
        assertEquals("mock-access-token", res.get("accessToken"));
        assertNotNull(res.get("usuario"));
        verify(usuarioRepo, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("TC-09: Registro con Email Duplicado - Falla con mensaje informativo")
    void testRegistroEmailDuplicado() {
        Map<String, Object> datos = new HashMap<>();
        datos.put("email", "carlos@mercatto.com");
        datos.put("nombre", "Carlos");
        datos.put("password", "123456");

        when(usuarioRepo.existsByEmail("carlos@mercatto.com")).thenReturn(true);

        Map<String, Object> res = authService.registrar(datos);

        assertFalse((Boolean) res.get("exito"));
        assertTrue(((String) res.get("mensaje")).contains("ya está registrado"));
        verify(usuarioRepo, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("TC-10: Registro de Vendedor - Crea cuenta activa y registra tienda oficial con tokens")
    void testRegistroVendedorPendiente() {
        Map<String, Object> datos = new HashMap<>();
        datos.put("email", "tienda@mercatto.com");
        datos.put("nombre", "Dueño Tienda");
        datos.put("nombreTienda", "Artesanías del Caribe");
        datos.put("nitCedula", "900123456");
        datos.put("banco", "Bancolombia");
        datos.put("cuentaBancaria", "123456789");
        datos.put("password", "ClaveVendedor123");
        datos.put("rol", "VENDEDOR");

        when(usuarioRepo.existsByEmail("tienda@mercatto.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(usuarioRepo.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(jwtUtil.generarAccessToken(anyString(), anyString())).thenReturn("mock-vendor-access-token");
        when(jwtUtil.generarRefreshToken(anyString())).thenReturn("mock-vendor-refresh-token");

        Map<String, Object> res = authService.registrar(datos);

        assertTrue((Boolean) res.get("exito"));
        assertEquals("mock-vendor-access-token", res.get("accessToken"));
        verify(vendedorRepo, times(1)).save(any(Vendedor.class));
    }

    @Test
    @DisplayName("TC-11: Login Exitoso - Con credenciales válidas genera tokens y actualiza último login")
    void testLoginExitoso() {
        when(usuarioRepo.findByEmail("carlos@mercatto.com")).thenReturn(Optional.of(comprador));
        when(passwordEncoder.matches("MiClaveSegura", "$2a$10$hashedpassword")).thenReturn(true);
        when(jwtUtil.generarAccessToken("carlos@mercatto.com", "COMPRADOR")).thenReturn("valid-jwt");
        when(jwtUtil.generarRefreshToken("carlos@mercatto.com")).thenReturn("valid-refresh");

        Map<String, Object> res = authService.login("carlos@mercatto.com", "MiClaveSegura", true);

        assertTrue((Boolean) res.get("exito"));
        assertEquals("valid-jwt", res.get("accessToken"));
        assertEquals("valid-refresh", res.get("refreshToken"));
        verify(usuarioRepo, times(1)).save(comprador);
    }

    @Test
    @DisplayName("TC-12: Login Contraseña Errónea - Falla y registra intento no exitoso")
    void testLoginPasswordErroneo() {
        when(usuarioRepo.findByEmail("carlos@mercatto.com")).thenReturn(Optional.of(comprador));
        when(passwordEncoder.matches("ClaveErronea", "$2a$10$hashedpassword")).thenReturn(false);

        Map<String, Object> res = authService.login("carlos@mercatto.com", "ClaveErronea", false);

        assertFalse((Boolean) res.get("exito"));
        assertEquals("Correo o contraseña incorrectos.", res.get("mensaje"));
    }
}
