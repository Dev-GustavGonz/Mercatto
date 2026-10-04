package com.mercatto.modules.usuario.controller;

import com.mercatto.dto.request.GoogleAuthRequest;
import com.mercatto.security.JwtUtil;
import com.mercatto.modules.usuario.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private JwtUtil jwtUtil;

    // En local (http) debe quedar en false. En producción (https) ponlo en true
    // vía la variable de entorno / application-prod.properties: app.cookie.secure=true
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    private static final String COOKIE_REFRESH = "mercatto_refresh_token";

    // POST /api/auth/registro
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, Object> datos, HttpServletResponse response) {
        Map<String, Object> res = authService.registrar(datos);
        adjuntarCookieRefresco(res, response);
        int status = Boolean.TRUE.equals(res.get("exito")) ? 201 : 400;
        return ResponseEntity.status(status).body(res);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> datos, HttpServletResponse response) {
        boolean recordarme = Boolean.TRUE.equals(datos.get("recordarme"));
        Map<String, Object> res = authService.login(
            (String) datos.get("email"), (String) datos.get("password"), recordarme);
        adjuntarCookieRefresco(res, response);
        int status = Boolean.TRUE.equals(res.get("exito")) ? 200 : 401;
        return ResponseEntity.status(status).body(res);
    }

    // POST /api/auth/google
    @PostMapping("/google")
    public ResponseEntity<?> google(@RequestBody GoogleAuthRequest datos, HttpServletResponse response) {
        // El login con Google siempre "recuerda" la sesión (no tiene checkbox propio).
        Map<String, Object> res = authService.loginConGoogle(datos.getCredential(), true);
        adjuntarCookieRefresco(res, response);
        int status = Boolean.TRUE.equals(res.get("exito")) ? 200 : 401;
        return ResponseEntity.status(status).body(res);
    }

    // POST /api/auth/refresh — el refresh token viaja en la cookie httpOnly, ya no en el body
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = COOKIE_REFRESH, required = false) String refreshToken,
            HttpServletResponse response) {
        Map<String, Object> res = authService.refresh(refreshToken);
        int status = Boolean.TRUE.equals(res.get("exito")) ? 200 : 401;
        if (status == 401) {
            // token inválido/expirado: limpiamos la cookie para no seguir intentando con basura
            response.addHeader(HttpHeaders.SET_COOKIE, limpiarCookie().toString());
        }
        return ResponseEntity.status(status).body(res);
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletResponse response) {
        if (userDetails != null)
            authService.logout(userDetails.getUsername());
        response.addHeader(HttpHeaders.SET_COOKIE, limpiarCookie().toString());
        return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Sesión cerrada."));
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).body(Map.of("exito", false));
        return ResponseEntity.ok(Map.of(
            "exito", true,
            "email", userDetails.getUsername(),
            "rol", userDetails.getAuthorities().iterator().next().getAuthority()
        ));
    }

    // ── Helpers de cookie ────────────────────────────────────────────

    // Saca "refreshToken"/"recordarme" del cuerpo de la respuesta y los convierte
    // en una cookie httpOnly. Así el token nunca llega al JSON ni a JavaScript.
    private void adjuntarCookieRefresco(Map<String, Object> res, HttpServletResponse response) {
        Object tokenObj = res.remove("refreshToken");
        Object recordarmeObj = res.remove("recordarme");
        if (tokenObj != null) {
            boolean recordarme = Boolean.TRUE.equals(recordarmeObj);
            response.addHeader(HttpHeaders.SET_COOKIE,
                construirCookieRefresh((String) tokenObj, recordarme).toString());
        }
    }

    private ResponseCookie construirCookieRefresh(String token, boolean recordarme) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(COOKIE_REFRESH, token)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path("/api/auth");
        // Con "recordarme": cookie persistente 30 días.
        // Sin "recordarme": cookie de sesión (sin maxAge) — desaparece al cerrar el navegador.
        if (recordarme) builder.maxAge(Duration.ofDays(30));
        return builder.build();
    }

    private ResponseCookie limpiarCookie() {
        return ResponseCookie.from(COOKIE_REFRESH, "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path("/api/auth")
            .maxAge(0)
            .build();
    }
}