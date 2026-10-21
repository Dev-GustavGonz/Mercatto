package com.mercatto.modules.producto.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Servicio para gestión y subida de imágenes a Supabase Storage con validaciones
 * de tipo de archivo (JPG, PNG, WEBP, GIF) y tamaño máximo de 2 MB.
 */
@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    // Límite estricto de tamaño: 2 MB (2,097,152 bytes)
    public static final long MAX_FILE_SIZE = 2 * 1024 * 1024;

    // MIME types permitidos para imágenes
    private static final List<String> MIME_TYPES_PERMITIDOS = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    // Extensiones de archivo permitidas
    private static final List<String> EXTENSIONES_PERMITIDAS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );

    @Value("${supabase.url:https://cirxekyibynidhbnffll.supabase.co}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:Mercatto}")
    private String bucketName;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    /**
     * Valida el archivo (formato y tamaño máx 2 MB) y lo sube al bucket de Supabase Storage.
     *
     * @param archivo Archivo multipart recibido en la petición
     * @return Map con la URL pública generada ("url") y el identificador/ruta ("publicId")
     * @throws IllegalArgumentException si el archivo no cumple las validaciones
     * @throws IOException si ocurre un error de lectura o conexión
     */
    public Map<String, Object> subirImagen(MultipartFile archivo) throws IOException {
        validarArchivo(archivo);

        // Fallback local por seguridad si no estuvieran configuradas las credenciales
        if (supabaseKey == null || supabaseKey.isBlank() || supabaseUrl == null || supabaseUrl.isBlank()) {
            log.warn("Supabase Storage no configurado, guardando localmente.");
            return guardarLocalmente(archivo);
        }

        String extension = obtenerExtension(archivo.getOriginalFilename());
        String contentType = archivo.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = deducirMimeType(extension);
        }

        // Nombre de archivo único y sanitizado
        String safeOriginal = sanitizarNombre(archivo.getOriginalFilename());
        String fileName = UUID.randomUUID() + "_" + safeOriginal;

        String endpoint = String.format("%s/storage/v1/object/%s/%s",
                limpiarUrl(supabaseUrl), bucketName, fileName);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + supabaseKey.trim())
                    .header("apikey", supabaseKey.trim())
                    .header("Content-Type", contentType)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(archivo.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = String.format("%s/storage/v1/object/public/%s/%s",
                        limpiarUrl(supabaseUrl), bucketName, fileName);
                log.info("Imagen subida con éxito a Supabase Storage: {}", publicUrl);
                return Map.of(
                        "url", publicUrl,
                        "publicId", fileName
                );
            } else {
                log.error("Error al subir a Supabase Storage. HTTP {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Error en Supabase Storage (HTTP " + response.statusCode() + "): " + response.body());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("La subida a Supabase fue interrumpida", e);
        }
    }

    /**
     * Valida obligatoriamente:
     * 1. Que el archivo no sea nulo ni vacío.
     * 2. Que no supere 2 MB.
     * 3. Que sea formato JPG, PNG, WEBP o GIF (por extensión y por Content-Type).
     */
    public void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("No se ha proporcionado ningún archivo para subir.");
        }

        // Validación de tamaño (máximo 2 MB)
        if (archivo.getSize() > MAX_FILE_SIZE) {
            double megas = (double) archivo.getSize() / (1024 * 1024);
            throw new IllegalArgumentException(String.format(
                    "El archivo pesa %.2f MB y supera el tamaño máximo permitido de 2 MB.", megas));
        }

        // Validación por extensión del archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = obtenerExtension(nombreOriginal).toLowerCase();
        if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
            throw new IllegalArgumentException(
                    "Formato de archivo no permitido (" + extension + "). Solo se aceptan imágenes JPG, PNG, WEBP o GIF.");
        }

        // Validación por Content-Type MIME
        String contentType = archivo.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String lowerType = contentType.toLowerCase().split(";")[0].trim();
            if (!MIME_TYPES_PERMITIDOS.contains(lowerType)) {
                throw new IllegalArgumentException(
                        "Tipo MIME no permitido (" + lowerType + "). Solo se aceptan imágenes JPG, PNG, WEBP o GIF.");
            }
        }
    }

    private String obtenerExtension(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return ".jpg";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf("."));
    }

    private String deducirMimeType(String extension) {
        return switch (extension.toLowerCase()) {
            case ".png" -> "image/png";
            case ".webp" -> "image/webp";
            case ".gif" -> "image/gif";
            default -> "image/jpeg";
        };
    }

    private String sanitizarNombre(String original) {
        if (original == null || original.isBlank()) {
            return "imagen.jpg";
        }
        return original.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String limpiarUrl(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private Map<String, Object> guardarLocalmente(MultipartFile archivo) throws IOException {
        String uploadsDir = "uploads/";
        Path path = Paths.get(uploadsDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        String fileName = UUID.randomUUID() + "_" + sanitizarNombre(archivo.getOriginalFilename());
        Path filePath = path.resolve(fileName);
        Files.copy(archivo.getInputStream(), filePath);

        return Map.of(
                "url", "/uploads/" + fileName,
                "publicId", fileName
        );
    }
}
