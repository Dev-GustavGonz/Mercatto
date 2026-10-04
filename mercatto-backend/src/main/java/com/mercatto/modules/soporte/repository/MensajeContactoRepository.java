package com.mercatto.modules.soporte.repository;

import com.mercatto.modules.soporte.model.MensajeContacto;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MensajeContactoRepository extends JpaRepository<MensajeContacto, Long> {

    List<MensajeContacto> findByProductoAndCompradorOrderByFechaEnvioAsc(Producto producto, Usuario comprador);

    Page<MensajeContacto> findByVendedorOrderByFechaEnvioDesc(Vendedor vendedor, Pageable pageable);

    Page<MensajeContacto> findByCompradorOrderByFechaEnvioDesc(Usuario comprador, Pageable pageable);

    long countByVendedorAndLeidoFalse(Vendedor vendedor);

    long countByCompradorAndLeidoFalse(Usuario comprador);

    @Query("SELECT m FROM MensajeContacto m WHERE (m.comprador = :usuario OR m.vendedor.usuario = :usuario) AND m.producto.id = :productoId ORDER BY m.fechaEnvio ASC")
    List<MensajeContacto> findConversacion(@Param("usuario") Usuario usuario, @Param("productoId") Long productoId);
}
