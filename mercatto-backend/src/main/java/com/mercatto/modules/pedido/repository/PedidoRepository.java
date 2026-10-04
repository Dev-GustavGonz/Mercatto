package com.mercatto.modules.pedido.repository;

import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByCodigo(String codigo);
    Page<Pedido> findByCompradorOrderByFechaCreacionDesc(Usuario comprador, Pageable pageable);
    Page<Pedido> findAllByOrderByFechaCreacionDesc(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Pedido p JOIN p.items item WHERE item.vendedor = :vendedor ORDER BY p.fechaCreacion DESC")
    Page<Pedido> findByVendedor(@Param("vendedor") Vendedor vendedor, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT p) FROM Pedido p JOIN p.items item WHERE item.vendedor = :vendedor")
    long countByVendedor(@Param("vendedor") Vendedor vendedor);

    @Query("SELECT COALESCE(SUM(item.subtotal), 0.0) FROM Pedido p JOIN p.items item WHERE item.vendedor = :vendedor AND p.estado != com.mercatto.modules.pedido.model.Pedido$EstadoPedido.PENDIENTE AND p.estado != com.mercatto.modules.pedido.model.Pedido$EstadoPedido.CANCELADO")
    Double sumIngresosByVendedor(@Param("vendedor") Vendedor vendedor);

    @Query("SELECT COALESCE(SUM(p.total), 0.0) FROM Pedido p WHERE p.estado != com.mercatto.modules.pedido.model.Pedido$EstadoPedido.PENDIENTE AND p.estado != com.mercatto.modules.pedido.model.Pedido$EstadoPedido.CANCELADO")
    Double sumIngresosTotales();
}
