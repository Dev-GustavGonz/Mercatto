package com.mercatto.modules.producto.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:TU_CLOUD_NAME}")
    private String cloudName;

    @Value("${cloudinary.api-key:TU_API_KEY}")
    private String apiKey;

    @Value("${cloudinary.api-secret:TU_API_SECRET}")
    private String apiSecret;

    private Cloudinary cloudinary;

    private Cloudinary getClient() {
        if (cloudinary == null) {
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            cloudinary = new Cloudinary(config);
        }
        return cloudinary;
    }

    public Map<String, Object> subirImagen(MultipartFile archivo) throws IOException {
        // Si no están configuradas las credenciales de Cloudinary, guardamos localmente como fallback
        if (cloudName == null || cloudName.startsWith("TU_CLOUD") || apiKey.startsWith("TU_API")) {
            return guardarLocalmente(archivo);
        }

        File file = File.createTempFile("mercatto_", archivo.getOriginalFilename());
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(archivo.getBytes());
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> result = getClient().uploader().upload(file, ObjectUtils.asMap(
                "folder", "mercatto_marketplace",
                "resource_type", "auto"
        ));

        file.delete();
        return Map.of(
                "url", result.get("secure_url"),
                "publicId", result.get("public_id")
        );
    }

    private Map<String, Object> guardarLocalmente(MultipartFile archivo) throws IOException {
        String uploadsDir = "uploads/";
        Path path = Paths.get(uploadsDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        String fileName = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        Path filePath = path.resolve(fileName);
        Files.copy(archivo.getInputStream(), filePath);

        return Map.of(
                "url", "/uploads/" + fileName,
                "publicId", fileName
        );
    }
}
