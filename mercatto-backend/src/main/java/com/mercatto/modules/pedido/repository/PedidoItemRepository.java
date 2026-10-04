package com.mercatto.modules.pedido.repository;

import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.vendedor.model.Vendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
    List<PedidoItem> findByPedido(Pedido pedido);
    List<PedidoItem> findByVendedor(Vendedor vendedor);
}
