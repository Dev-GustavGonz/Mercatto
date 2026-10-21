package com.mercatto.modules.producto.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Servicio de almacenamiento. Redirige todas las subidas a {@link SupabaseStorageService}.
 * Se mantiene por compatibilidad hacia atrás con los controladores existentes.
 */
@Service
public class CloudinaryService {

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    public Map<String, Object> subirImagen(MultipartFile archivo) throws IOException {
        return supabaseStorageService.subirImagen(archivo);
    }
}
