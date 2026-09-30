package com.mercatto.repository;

import com.mercatto.model.Pago;
import com.mercatto.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    Optional<Pago> findByPedido(Pedido pedido);
    Optional<Pago> findByTransaccionId(String transaccionId);
    Optional<Pago> findByPasarelaReferencia(String pasarelaReferencia);
}
