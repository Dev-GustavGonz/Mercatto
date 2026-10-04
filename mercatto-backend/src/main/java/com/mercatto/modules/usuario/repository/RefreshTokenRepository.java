package com.mercatto.modules.usuario.repository;

import com.mercatto.modules.usuario.model.RefreshToken;
import com.mercatto.modules.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revocado = true WHERE r.usuario = :usuario")
    void revocarTokensDeUsuario(Usuario usuario);
}
