package com.mercatto.modules.producto.service;

import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.modules.producto.model.Categoria;
import com.mercatto.modules.producto.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepo;

    public List<Categoria> listarPrincipales() {
        return categoriaRepo.findByPadreIsNullAndActivoTrueOrderByOrdenVisualAsc();
    }

    public List<Categoria> listarTodas() {
        return categoriaRepo.findByActivoTrueOrderByOrdenVisualAsc();
    }

    public Categoria obtenerPorId(Long id) {
        return categoriaRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + id));
    }

    public Categoria obtenerPorSlug(String slug) {
        return categoriaRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con slug: " + slug));
    }

    @Transactional
    public Categoria crear(Categoria categoria, Long padreId) {
        if (categoriaRepo.existsByNombre(categoria.getNombre())) {
            throw new BadRequestException("Ya existe una categoría con el nombre: " + categoria.getNombre());
        }
        if (categoria.getSlug() == null || categoria.getSlug().isBlank()) {
            categoria.setSlug(generarSlug(categoria.getNombre()));
        }
        if (padreId != null) {
            Categoria padre = obtenerPorId(padreId);
            categoria.setPadre(padre);
        }
        return categoriaRepo.save(categoria);
    }

    @Transactional
    public Categoria actualizar(Long id, Categoria datos, Long padreId) {
        Categoria categoria = obtenerPorId(id);
        categoria.setNombre(datos.getNombre());
        categoria.setDescripcion(datos.getDescripcion());
        categoria.setIcono(datos.getIcono());
        categoria.setImagenUrl(datos.getImagenUrl());
        categoria.setActivo(datos.isActivo());
        categoria.setOrdenVisual(datos.getOrdenVisual());

        if (padreId != null && !padreId.equals(id)) {
            Categoria padre = obtenerPorId(padreId);
            categoria.setPadre(padre);
        } else if (padreId == null) {
            categoria.setPadre(null);
        }

        return categoriaRepo.save(categoria);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria cat = obtenerPorId(id);
        categoriaRepo.delete(cat);
    }

    private String generarSlug(String input) {
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
