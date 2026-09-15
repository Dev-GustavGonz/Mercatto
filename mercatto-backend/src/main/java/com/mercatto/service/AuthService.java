package com.mercatto.service;

import com.mercatto.model.*;
import com.mercatto.repository.*;
import com.mercatto.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AuthService {

    @Autowired private UsuarioRepository  usuarioRepo;
    @Autowired private VendedorRepository vendedorRepo;
    @Autowired private RefreshTokenRepository refreshRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private GoogleTokenService googleTokenService;

    // ── Brute-force protection ────────────────────────────────────
    private static final int  MAX_INTENTOS = 5;
    private static final long BLOQUEO_MS   = 15 * 60 * 1000L;
    private final Map<String, AtomicInteger> intentos      = new ConcurrentHashMap<>();
    private final Map<String, Long>          bloqueadoHasta = new ConcurrentHashMap<>();

    private boolean estaBloqueado(String email) {
        Long hasta = bloqueadoHasta.get(email);
        if (hasta == null) return false;
        if (System.currentTimeMillis() < hasta) return true;
        bloqueadoHasta.remove(email);
        intentos.remove(email);
        return false;
    }

    private void registrarIntento(String email, boolean exitoso) {
        if (exitoso) {
            intentos.remove(email);
            bloqueadoHasta.remove(email);
            return;
        }
        AtomicInteger n = intentos.computeIfAbsent(email, k -> new AtomicInteger(0));
        if (n.incrementAndGet() >= MAX_INTENTOS)
            bloqueadoHasta.put(email, System.currentTimeMillis() + BLOQUEO_MS);
    }

    // ── REGISTRO ──────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> registrar(Map<String, Object> datos) {
        Map<String, Object> res = new HashMap<>();
        String email    = (String) datos.get("email");
        String nombre   = (String) datos.get("nombre");
        String password = (String) datos.get("password");
        String rolStr   = (String) datos.getOrDefault("rol", "COMPRADOR");

        if (usuarioRepo.existsByEmail(email)) {
            res.put("exito", false);
            res.put("mensaje", "El correo " + email + " ya está registrado.");
            return res;
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(Usuario.Rol.valueOf(rolStr));
        usuario.setActivo(!"VENDEDOR".equals(rolStr));
        Usuario guardado = usuarioRepo.save(usuario);

        if ("VENDEDOR".equals(rolStr)) {
            @SuppressWarnings("unchecked")
            Map<String, String> datosVendedor = (Map<String, String>) datos.get("vendedor");
            Vendedor vendedor = new Vendedor();
            vendedor.setUsuario(guardado);
            vendedor.setNombreTienda(datosVendedor.get("nombreTienda"));
            vendedor.setTipo(Vendedor.Tipo.valueOf(
                datosVendedor.getOrDefault("tipo", "PERSONA_NATURAL")));
            vendedor.setNitCedula(datosVendedor.get("nitCedula"));
            vendedor.setCiudad(datosVendedor.get("ciudad"));
            vendedor.setEstado(Vendedor.Estado.PENDIENTE);
            vendedorRepo.save(vendedor);

            res.put("exito", true);
            res.put("pendiente", true);
            res.put("mensaje", "Solicitud enviada. El administrador la revisará pronto.");
        } else {
            boolean recordarme = !Boolean.FALSE.equals(datos.get("recordarme"));
            String accessToken  = jwtUtil.generarAccessToken(email, rolStr);
            String refreshToken = jwtUtil.generarRefreshToken(email);
            guardarRefreshToken(guardado, refreshToken, recordarme);

            res.put("exito", true);
            res.put("accessToken", accessToken);
            res.put("refreshToken", refreshToken); // el controller la mueve a una cookie httpOnly
            res.put("recordarme", recordarme);
            res.put("usuario", usuarioAMapa(guardado));
            res.put("mensaje", "¡Bienvenido a Mercatto!");
        }
        return res;
    }

    // ── LOGIN ─────────────────────────────────────────────────────
    @Transactional
    public Map<String, Object> login(String email, String password, boolean recordarme) {
        Map<String, Object> res = new HashMap<>();

        if (estaBloqueado(email)) {
            res.put("exito", false);
            res.put("mensaje", "Demasiados intentos fallidos. Espera 15 minutos.");
            return res;
        }

        Optional<Usuario> opt = usuarioRepo.findByEmail(email);
        boolean credencialesValidas = opt.isPresent()
                && opt.get().getPassword() != null
                && passwordEncoder.matches(password, opt.get().getPassword());

        if (!credencialesValidas) {
            registrarIntento(email, false);
            res.put("exito", false);
            if (opt.isPresent() && opt.get().getPassword() == null) {
                res.put("mensaje", "Esta cuenta fue creada con Google. Inicia sesión con el botón de Google.");
            } else {
                res.put("mensaje", "Correo o contraseña incorrectos.");
            }
            return res;
        }

        Usuario usuario = opt.get();

        if (!usuario.isActivo()) {
            if (usuario.getRol() == Usuario.Rol.VENDEDOR) {
                res.put("exito", false);
                res.put("pendiente", true);
                res.put("mensaje", "Tu cuenta está pendiente de aprobación.");
            } else {
                res.put("exito", false);
                res.put("mensaje", "Tu cuenta está suspendida. Contacta al soporte.");
            }
            return res;
        }

        registrarIntento(email, true);
        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepo.save(usuario);

        String accessToken  = jwtUtil.generarAccessToken(email, usuario.getRol().name());
        String refreshToken = jwtUtil.generarRefreshToken(email);
        guardarRefreshToken(usuario, refreshToken, recordarme);

        res.put("exito", true);
        res.put("accessToken", accessToken);
        res.put("refreshToken", refreshToken);
        res.put("recordarme", recordarme);
        res.put("usuario", usuarioAMapa(usuario));
        return res;
    }

    // ── LOGIN / REGISTRO CON GOOGLE ──────────────────────────────────
    @Transactional
    public Map<String, Object> loginConGoogle(String idToken, boolean recordarme) {
        Map<String, Object> res = new HashMap<>();

        GoogleTokenService.GooglePayload datos = googleTokenService.verificar(idToken);

        Optional<Usuario> opt = usuarioRepo.findByEmail(datos.email);
        Usuario usuario;

        if (opt.isPresent()) {
            usuario = opt.get();

            if (!usuario.isActivo()) {
                if (usuario.getRol() == Usuario.Rol.VENDEDOR) {
                    res.put("exito", false);
                    res.put("pendiente", true);
                    res.put("mensaje", "Tu cuenta está pendiente de aprobación.");
                } else {
                    res.put("exito", false);
                    res.put("mensaje", "Tu cuenta está suspendida. Contacta al soporte.");
                }
                return res;
            }

            // Si el usuario ya existía con registro local, vinculamos su Google ID
            if (usuario.getGoogleId() == null) {
                usuario.setGoogleId(datos.sub);
                if (usuario.getProveedor() == Usuario.Proveedor.LOCAL && usuario.getPassword() == null) {
                    usuario.setProveedor(Usuario.Proveedor.GOOGLE);
                }
            }
            if (!usuario.isEmailVerificado()) usuario.setEmailVerificado(true);
            if (usuario.getFotoPerfil() == null && datos.foto != null) usuario.setFotoPerfil(datos.foto);
        } else {
            usuario = new Usuario();
            usuario.setNombre(datos.nombre != null ? datos.nombre : datos.email);
            usuario.setEmail(datos.email);
            usuario.setPassword(null); // cuenta exclusiva de Google, sin contraseña local
            usuario.setRol(Usuario.Rol.COMPRADOR);
            usuario.setActivo(true);
            usuario.setEmailVerificado(true);
            usuario.setFotoPerfil(datos.foto);
            usuario.setProveedor(Usuario.Proveedor.GOOGLE);
            usuario.setGoogleId(datos.sub);
        }

        usuario.setUltimoLogin(LocalDateTime.now());
        usuario = usuarioRepo.save(usuario);

        String accessToken  = jwtUtil.generarAccessToken(usuario.getEmail(), usuario.getRol().name());
        String refreshToken = jwtUtil.generarRefreshToken(usuario.getEmail());
        guardarRefreshToken(usuario, refreshToken, recordarme);

        res.put("exito", true);
        res.put("accessToken", accessToken);
        res.put("refreshToken", refreshToken);
        res.put("recordarme", recordarme);
        res.put("usuario", usuarioAMapa(usuario));
        res.put("mensaje", "¡Bienvenido a Mercatto!");
        return res;
    }

    // ── REFRESH TOKEN ─────────────────────────────────────────────
    // El refreshToken llega desde la cookie httpOnly (ver AuthController).
    // Si es null (no hay cookie / sesión no "recordada"), simplemente no hay sesión que restaurar.
    @Transactional
    public Map<String, Object> refresh(String refreshToken) {
        Map<String, Object> res = new HashMap<>();
        if (refreshToken == null) {
            res.put("exito", false);
            res.put("mensaje", "No hay sesión activa.");
            return res;
        }

        Optional<RefreshToken> opt = refreshRepo.findByToken(refreshToken);

        if (opt.isEmpty() || !opt.get().esValido()) {
            res.put("exito", false);
            res.put("mensaje", "Token inválido o expirado.");
            return res;
        }

        Usuario usuario = opt.get().getUsuario();
        String nuevoAccess = jwtUtil.generarAccessToken(
            usuario.getEmail(), usuario.getRol().name());

        res.put("exito", true);
        res.put("accessToken", nuevoAccess);
        res.put("usuario", usuarioAMapa(usuario));
        return res;
    }

    // ── LOGOUT ────────────────────────────────────────────────────
    @Transactional
    public void logout(String email) {
        usuarioRepo.findByEmail(email)
            .ifPresent(u -> refreshRepo.revocarTokensDeUsuario(u));
    }

    // ── Helpers ───────────────────────────────────────────────────
    // Si "recordarme" está marcado, el refresh token (y su cookie) dura 30 días.
    // Si no, dura solo 1 día: al cerrar el navegador la cookie de sesión desaparece igual.
    private void guardarRefreshToken(Usuario usuario, String token, boolean recordarme) {
        RefreshToken rt = new RefreshToken();
        rt.setUsuario(usuario);
        rt.setToken(token);
        rt.setExpiracion(LocalDateTime.now().plusDays(recordarme ? 30 : 1));
        refreshRepo.save(rt);
    }

    private Map<String, Object> usuarioAMapa(Usuario u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        u.getId());
        m.put("nombre",    u.getNombre());
        m.put("email",     u.getEmail());
        m.put("rol",       u.getRol().name());
        m.put("activo",    u.isActivo());
        m.put("fotoPerfil",u.getFotoPerfil());
        return m;
    }
}