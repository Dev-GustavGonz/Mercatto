package com.mercatto.modules.producto.repository;

import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.Resena;
import com.mercatto.modules.usuario.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    Page<Resena> findByProductoOrderByFechaCreacionDesc(Producto producto, Pageable pageable);
    Optional<Resena> findByProductoAndUsuario(Producto producto, Usuario usuario);
    boolean existsByProductoAndUsuario(Producto producto, Usuario usuario);

    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto = :producto")
    Double calcularPromedioCalificacion(@Param("producto") Producto producto);

    long countByProducto(Producto producto);
}
