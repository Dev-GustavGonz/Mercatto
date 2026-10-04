package com.mercatto.modules.pedido.repository;

import com.mercatto.modules.pedido.model.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {
    Optional<Cupon> findByCodigoIgnoreCaseAndActivoTrue(String codigo);
    Optional<Cupon> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
}
