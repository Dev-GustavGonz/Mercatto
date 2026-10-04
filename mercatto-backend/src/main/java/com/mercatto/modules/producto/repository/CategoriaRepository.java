package com.mercatto.modules.producto.repository;

import com.mercatto.modules.producto.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findBySlug(String slug);
    boolean existsByNombre(String nombre);
    boolean existsBySlug(String slug);
    List<Categoria> findByActivoTrueOrderByOrdenVisualAsc();
    List<Categoria> findByPadreIsNullAndActivoTrueOrderByOrdenVisualAsc();
}
