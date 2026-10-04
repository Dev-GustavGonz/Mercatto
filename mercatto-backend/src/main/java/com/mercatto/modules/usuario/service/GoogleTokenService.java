package com.mercatto.modules.usuario.service;

import com.mercatto.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Verifica los ID Tokens (JWT) emitidos por Google Identity Services.
 *
 * Usamos el endpoint público de "tokeninfo" de Google en lugar de añadir la
 * librería google-api-client: es más liviano y suficiente para validar
 * firma, emisor, audiencia (client-id) y vigencia del token.
 * https://developers.google.com/identity/sign-in/web/backend-auth
 */
@Service
public class GoogleTokenService {

    private static final String TOKENINFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @Value("${google.client-id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    public GooglePayload verificar(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("Token de Google no proporcionado.");
        }
        if (googleClientId == null || googleClientId.isBlank()
                || googleClientId.contains("TU_GOOGLE_CLIENT_ID")) {
            throw new UnauthorizedException(
                    "El inicio de sesión con Google no está configurado en el servidor (google.client-id).");
        }

        Map<String, Object> payload;
        try {
            payload = restTemplate.getForObject(TOKENINFO_URL + idToken, Map.class);
        } catch (RestClientException e) {
            throw new UnauthorizedException("No se pudo verificar el token de Google.");
        }

        if (payload == null) {
            throw new UnauthorizedException("Token de Google inválido.");
        }

        String aud = (String) payload.get("aud");
        if (!googleClientId.equals(aud)) {
            throw new UnauthorizedException("El token de Google no corresponde a esta aplicación.");
        }

        String emailVerificado = String.valueOf(payload.get("email_verified"));
        if (!"true".equalsIgnoreCase(emailVerificado)) {
            throw new UnauthorizedException("El correo de tu cuenta de Google no está verificado.");
        }

        GooglePayload resultado = new GooglePayload();
        resultado.sub = (String) payload.get("sub");
        resultado.email = (String) payload.get("email");
        resultado.nombre = (String) payload.getOrDefault("name", resultado.email);
        resultado.foto = (String) payload.get("picture");
        return resultado;
    }

    public static class GooglePayload {
        public String sub;
        public String email;
        public String nombre;
        public String foto;
    }
}
