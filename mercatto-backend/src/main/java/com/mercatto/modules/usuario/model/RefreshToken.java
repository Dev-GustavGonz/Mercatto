package com.mercatto.modules.usuario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 500)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiracion;

    @Column(nullable = false)
    private boolean revocado = false;

    public RefreshToken() {}

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(expiracion);
    }

    public boolean esValido() {
        return !revocado && !estaExpirado();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public LocalDateTime getExpiracion() { return expiracion; }
    public void setExpiracion(LocalDateTime expiracion) { this.expiracion = expiracion; }

    public boolean isRevocado() { return revocado; }
    public void setRevocado(boolean revocado) { this.revocado = revocado; }
}
