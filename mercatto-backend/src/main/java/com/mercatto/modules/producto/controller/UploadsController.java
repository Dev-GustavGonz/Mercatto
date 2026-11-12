package com.mercatto.modules.producto.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * UploadsController - Servidor directo de archivos multimedia locales.
 * Garantiza que cualquier archivo guardado en el directorio uploads/ sea accesible
 * inmediatamente sin depender de la resolución de URIs de Spring MVC en Windows.
 */
@RestController
@CrossOrigin(origins = "*")
public class UploadsController {

    private static final Logger log = LoggerFactory.getLogger(UploadsController.class);

    private static final String[] SEARCH_DIRS = {
        "uploads",
        "mercatto-backend/uploads",
        "mercatto/mercatto-backend/uploads"
    };

    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> obtenerArchivo(@PathVariable String fileName) {
        // Sanitizar para prevenir Directory Traversal
        String safeName = fileName.replace("..", "").replace("/", "").replace("\\", "");

        for (String dir : SEARCH_DIRS) {
            Path path = Paths.get(dir, safeName).toAbsolutePath().normalize();
            File file = path.toFile();
            if (file.exists() && file.isFile() && file.canRead()) {
                Resource resource = new FileSystemResource(file);
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(path);
                } catch (Exception ignored) {}
                if (contentType == null) {
                    if (safeName.endsWith(".png")) contentType = "image/png";
                    else if (safeName.endsWith(".webp")) contentType = "image/webp";
                    else if (safeName.endsWith(".gif")) contentType = "image/gif";
                    else contentType = "image/jpeg";
                }

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            }
        }

        log.warn("Archivo solicitado no encontrado en uploads: {}", safeName);
        return ResponseEntity.notFound().build();
    }
}
