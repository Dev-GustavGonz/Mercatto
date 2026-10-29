package com.mercatto.modules.soporte.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class RenderKeepAliveService {

    private static final Logger log = LoggerFactory.getLogger(RenderKeepAliveService.class);

    @Value("${render.keep-alive.enabled:true}")
    private boolean enabled;

    @Value("${render.keep-alive.url:}")
    private String keepAliveUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private boolean warnedOnce = false;

    /**
     * Se ejecuta cada 13.5 minutos (810,000 ms = 13m 30s) con un retardo inicial de 1 minuto tras iniciar.
     * Render duerme las instancias gratuitas tras 15 minutos sin tráfico entrante.
     * Un ping entre 13 y 14 minutos mantiene la instancia caliente y despierta de forma ininterrumpida.
     */
    @Scheduled(fixedRateString = "${render.keep-alive.rate-ms:810000}", initialDelay = 60000)
    public void pingRenderService() {
        if (!enabled) {
            return;
        }

        String targetUrl = resolveTargetUrl();
        if (targetUrl == null || targetUrl.isBlank()) {
            if (!warnedOnce) {
                log.info("Render Keep-Alive habilitado. Para auto-ping interno en la nube, define la variable de entorno RENDER_EXTERNAL_URL en Render (ej: https://tu-backend.onrender.com).");
                warnedOnce = true;
            }
            return;
        }

        try {
            long inicio = System.currentTimeMillis();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "Mercatto-KeepAlive-Ping/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            long duracion = System.currentTimeMillis() - inicio;

            if (response.statusCode() >= 200 && response.statusCode() < 400) {
                log.info("Keep-Alive Render OK: GET {} -> Status {} ({} ms)", targetUrl, response.statusCode(), duracion);
            } else {
                log.warn("Keep-Alive Render respondió con advertencia: GET {} -> Status {} ({} ms)", targetUrl, response.statusCode(), duracion);
            }
        } catch (Exception e) {
            log.warn("Error en Keep-Alive Render hacia {}: {}", targetUrl, e.getMessage());
        }
    }

    private String resolveTargetUrl() {
        if (keepAliveUrl == null || keepAliveUrl.isBlank()) {
            return null;
        }
        String clean = keepAliveUrl.trim();
        if (clean.endsWith("/")) {
            clean = clean.substring(0, clean.length() - 1);
        }
        if (!clean.endsWith("/api/health") && !clean.endsWith("/api/ping")) {
            clean = clean + "/api/health";
        }
        return clean;
    }
}
