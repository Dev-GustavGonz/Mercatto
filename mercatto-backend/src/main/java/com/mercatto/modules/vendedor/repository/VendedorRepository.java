package com.mercatto.modules.vendedor.repository;

import com.mercatto.modules.vendedor.model.Vendedor;
import com.mercatto.modules.usuario.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {
    Optional<Vendedor> findByUsuario(Usuario usuario);
    Optional<Vendedor> findByUsuarioId(Long usuarioId);
    List<Vendedor> findByEstado(Vendedor.Estado estado);
    Page<Vendedor> findByEstado(Vendedor.Estado estado, Pageable pageable);
    long countByEstado(Vendedor.Estado estado);
}
