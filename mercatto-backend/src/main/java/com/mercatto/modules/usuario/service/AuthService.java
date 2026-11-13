package com.mercatto.modules.usuario.service;

import com.mercatto.modules.usuario.controller.AuthController;
import com.mercatto.modules.usuario.model.RefreshToken;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.usuario.repository.RefreshTokenRepository;
import com.mercatto.modules.usuario.repository.UsuarioRepository;
import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.vendedor.repository.VendedorRepository;

import com.mercatto.config.CacheConfig;
import com.mercatto.modules.soporte.service.EmailService;
import com.mercatto.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
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
    @Autowired(required = false) private EmailService emailService;

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
    @CacheEvict(value = {CacheConfig.CACHE_TIENDAS_PUBLICAS, CacheConfig.CACHE_TIENDA_DETALLE, CacheConfig.CACHE_MARCAS_PUBLICAS}, allEntries = true)
    public Map<String, Object> registrar(Map<String, Object> datos) {
        Map<String, Object> res = new HashMap<>();
        String email    = datos.get("email") != null ? String.valueOf(datos.get("email")).trim() : null;
        String nombre   = datos.get("nombre") != null 
                ? String.valueOf(datos.get("nombre")).trim() 
                : (datos.get("nombreCompleto") != null ? String.valueOf(datos.get("nombreCompleto")).trim() : "");
        String password = datos.get("password") != null ? String.valueOf(datos.get("password")) : null;
        String rolStr   = (String) datos.getOrDefault("rol", "COMPRADOR");

        if (email == null || email.isBlank()) {
            res.put("exito", false);
            res.put("mensaje", "El correo electrónico es obligatorio.");
            return res;
        }

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
        usuario.setTokensChat(5); // 5 tokens de bienvenida
        Usuario guardado = usuarioRepo.save(usuario);

        if ("VENDEDOR".equals(rolStr)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> datosVendedor = datos.get("vendedor") instanceof Map 
                    ? (Map<String, Object>) datos.get("vendedor") 
                    : null;

            String nombreTienda = datosVendedor != null && datosVendedor.get("nombreTienda") != null
                    ? String.valueOf(datosVendedor.get("nombreTienda")).trim()
                    : (datos.get("nombreTienda") != null ? String.valueOf(datos.get("nombreTienda")).trim() : "Tienda de " + nombre);

            String tipoStr = datosVendedor != null && datosVendedor.get("tipo") != null
                    ? String.valueOf(datosVendedor.get("tipo"))
                    : (datos.get("tipo") != null ? String.valueOf(datos.get("tipo")) : "PERSONA_NATURAL");

            String nitCedula = datosVendedor != null && datosVendedor.get("nitCedula") != null
                    ? String.valueOf(datosVendedor.get("nitCedula")).trim()
                    : (datos.get("nitCedula") != null ? String.valueOf(datos.get("nitCedula")).trim() : "");

            String ciudad = datosVendedor != null && datosVendedor.get("ciudad") != null
                    ? String.valueOf(datosVendedor.get("ciudad")).trim()
                    : (datos.get("ciudad") != null ? String.valueOf(datos.get("ciudad")).trim() : "Cartagena de Indias");

            String banco = datosVendedor != null && datosVendedor.get("banco") != null
                    ? String.valueOf(datosVendedor.get("banco")).trim()
                    : (datos.get("banco") != null ? String.valueOf(datos.get("banco")).trim() : "");

            String cuentaBancaria = datosVendedor != null && datosVendedor.get("cuentaBancaria") != null
                    ? String.valueOf(datosVendedor.get("cuentaBancaria")).trim()
                    : (datos.get("cuentaBancaria") != null ? String.valueOf(datos.get("cuentaBancaria")).trim() : "");

            Vendedor vendedor = new Vendedor();
            vendedor.setUsuario(guardado);
            vendedor.setNombreTienda(nombreTienda);
            try {
                vendedor.setTipo(Vendedor.Tipo.valueOf(tipoStr.toUpperCase()));
            } catch (Exception e) {
                vendedor.setTipo(Vendedor.Tipo.PERSONA_NATURAL);
            }
            vendedor.setNitCedula(nitCedula);
            vendedor.setCiudad(ciudad);
            vendedor.setBanco(banco);
            vendedor.setCuentaBancaria(cuentaBancaria);
            vendedor.setEstado(Vendedor.Estado.APROBADO);
            vendedorRepo.save(vendedor);

            guardado.setActivo(true);
            usuarioRepo.save(guardado);
        }

        boolean recordarme = !Boolean.FALSE.equals(datos.get("recordarme"));
        String accessToken  = jwtUtil.generarAccessToken(email, rolStr);
        String refreshToken = jwtUtil.generarRefreshToken(email);
        guardarRefreshToken(guardado, refreshToken, recordarme);

        res.put("exito", true);
        res.put("accessToken", accessToken);
        res.put("refreshToken", refreshToken); // el controller la mueve a una cookie httpOnly
        res.put("recordarme", recordarme);
        res.put("usuario", usuarioAMapa(guardado));
        res.put("mensaje", "VENDEDOR".equalsIgnoreCase(rolStr) 
                ? "¡Tienda oficial registrada y activada con éxito!" 
                : "¡Bienvenido a Mercatto!");
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

        // Sincronización fija de administradores
        if ("realmercatto@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRol(Usuario.Rol.ADMIN);
            usuario.setNombre("Mercatto");
            usuario.setActivo(true);
            usuario.setEmailVerificado(true);
        }
        if ("magudelo522@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRol(Usuario.Rol.ADMIN);
            if ("Admin Superior".equalsIgnoreCase(usuario.getNombre()) || usuario.getNombre() == null) {
                usuario.setNombre("admin");
            }
        }

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
            usuario.setTokensChat(5);
        }

        // Sincronización fija de administradores en Login con Google
        if ("realmercatto@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRol(Usuario.Rol.ADMIN);
            usuario.setNombre("Mercatto");
            usuario.setActivo(true);
            usuario.setEmailVerificado(true);
        }
        if ("magudelo522@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            usuario.setRol(Usuario.Rol.ADMIN);
            if ("Admin Superior".equalsIgnoreCase(usuario.getNombre()) || usuario.getNombre() == null) {
                usuario.setNombre("admin");
            }
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

        // Asegurar consistencia de administradores en refresh de token
        boolean modificado = false;
        if ("realmercatto@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            if (usuario.getRol() != Usuario.Rol.ADMIN || !"Mercatto".equals(usuario.getNombre())) {
                usuario.setRol(Usuario.Rol.ADMIN);
                usuario.setNombre("Mercatto");
                modificado = true;
            }
        }
        if ("magudelo522@gmail.com".equalsIgnoreCase(usuario.getEmail())) {
            if (usuario.getRol() != Usuario.Rol.ADMIN || "Admin Superior".equalsIgnoreCase(usuario.getNombre())) {
                usuario.setRol(Usuario.Rol.ADMIN);
                usuario.setNombre("admin");
                modificado = true;
            }
        }
        if (modificado) {
            usuario = usuarioRepo.save(usuario);
        }
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

    // ── RECUPERACIÓN DE CONTRASEÑA ────────────────────────────────
    public static class InfoRecuperacion {
        private final String codigo;
        private final LocalDateTime expiracion;

        public InfoRecuperacion(String codigo, LocalDateTime expiracion) {
            this.codigo = codigo;
            this.expiracion = expiracion;
        }

        public boolean esValido(String input) {
            return input != null && input.trim().equalsIgnoreCase(codigo) && LocalDateTime.now().isBefore(expiracion);
        }
    }

    private final Map<String, InfoRecuperacion> codigosRecuperacion = new ConcurrentHashMap<>();

    public Map<String, Object> solicitarRecuperacionPassword(String email) {
        Map<String, Object> res = new LinkedHashMap<>();
        if (email == null || email.isBlank()) {
            res.put("exito", false);
            res.put("mensaje", "Por favor ingresa tu correo electrónico.");
            return res;
        }

        String emailNorm = email.trim().toLowerCase();
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(emailNorm);
        if (usuarioOpt.isEmpty()) {
            res.put("exito", false);
            res.put("mensaje", "No encontramos ninguna cuenta registrada con el correo: " + emailNorm);
            return res;
        }

        Usuario usuario = usuarioOpt.get();
        if (!usuario.isActivo()) {
            res.put("exito", false);
            res.put("mensaje", "Esta cuenta se encuentra inactiva o suspendida. Contacta a soporte.");
            return res;
        }

        // Código numérico de 6 dígitos
        String codigo = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        codigosRecuperacion.put(emailNorm, new InfoRecuperacion(codigo, LocalDateTime.now().plusMinutes(15)));

        // Envío de correo
        try {
            if (emailService != null) {
                emailService.enviarCodigoRecuperacion(emailNorm, usuario.getNombre(), codigo);
            }
        } catch (Exception e) {
            // No interrumpir si el servicio de correo tiene advertencias
        }

        res.put("exito", true);
        res.put("mensaje", "Hemos enviado un código de verificación de 6 dígitos a " + emailNorm + ".");
        return res;
    }

    @Transactional
    public Map<String, Object> restablecerPassword(String email, String codigo, String nuevaPassword) {
        Map<String, Object> res = new LinkedHashMap<>();
        if (email == null || email.isBlank()) {
            res.put("exito", false);
            res.put("mensaje", "El correo electrónico es requerido.");
            return res;
        }
        if (codigo == null || codigo.isBlank()) {
            res.put("exito", false);
            res.put("mensaje", "El código de verificación es requerido.");
            return res;
        }
        if (nuevaPassword == null || nuevaPassword.length() < 6) {
            res.put("exito", false);
            res.put("mensaje", "La nueva contraseña debe tener al menos 6 caracteres.");
            return res;
        }

        String emailNorm = email.trim().toLowerCase();
        InfoRecuperacion info = codigosRecuperacion.get(emailNorm);
        if (info == null || !info.esValido(codigo)) {
            res.put("exito", false);
            res.put("mensaje", "El código de verificación es incorrecto o ya ha expirado. Por favor solicita uno nuevo.");
            return res;
        }

        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(emailNorm);
        if (usuarioOpt.isEmpty()) {
            res.put("exito", false);
            res.put("mensaje", "Usuario no encontrado.");
            return res;
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepo.save(usuario);

        // Invalidar código para evitar reuso
        codigosRecuperacion.remove(emailNorm);

        // Revocar sesiones activas antiguas por seguridad
        refreshRepo.revocarTokensDeUsuario(usuario);

        // Desbloquear brute-force si estaba bloqueado
        intentos.remove(emailNorm);
        bloqueadoHasta.remove(emailNorm);

        res.put("exito", true);
        res.put("mensaje", "Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.");
        return res;
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
        m.put("tokensChat",u.getTokensChat() != null ? u.getTokensChat() : 0);
        if (u.getRol() == Usuario.Rol.VENDEDOR) {
            vendedorRepo.findByUsuario(u).ifPresent(v -> {
                m.put("vendedorId", v.getId());
                m.put("nombreTienda", v.getNombreTienda());
                m.put("logoTienda", v.getLogoUrl());
                m.put("tipoSuscripcion", v.getTipoSuscripcion() != null ? v.getTipoSuscripcion().name() : "STARTER");
            });
        }
        return m;
    }
}