package com.mercatto.modules.pedido.repository;

import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
    List<PedidoItem> findByPedido(Pedido pedido);
    List<PedidoItem> findByVendedor(Vendedor vendedor);

    @Query("SELECT COALESCE(SUM(i.cantidad), 0) FROM PedidoItem i WHERE i.producto.id = :productoId AND i.pedido.estado IN (com.mercatto.modules.pedido.model.Pedido$EstadoPedido.PAGADO, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.EN_PREPARACION, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.ENVIADO, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.ENTREGADO)")
    Integer sumarVentasPagadasPorProducto(@Param("productoId") Long productoId);

    @Query("SELECT COALESCE(SUM(i.cantidad), 0) FROM PedidoItem i WHERE i.vendedor.id = :vendedorId AND i.pedido.estado IN (com.mercatto.modules.pedido.model.Pedido$EstadoPedido.PAGADO, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.EN_PREPARACION, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.ENVIADO, com.mercatto.modules.pedido.model.Pedido$EstadoPedido.ENTREGADO)")
    Integer sumarVentasPagadasPorVendedor(@Param("vendedorId") Long vendedorId);
}
