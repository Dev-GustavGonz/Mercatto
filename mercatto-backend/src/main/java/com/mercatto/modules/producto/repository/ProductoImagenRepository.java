package com.mercatto.modules.producto.repository;

import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.ProductoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, Long> {
    List<ProductoImagen> findByProductoOrderByOrdenVisualAsc(Producto producto);
    void deleteByProducto(Producto producto);
}
