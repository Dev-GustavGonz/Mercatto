package com.mercatto.dto.response;

import com.mercatto.modules.vendedor.model.Vendedor;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UsuarioInfo usuario;

    // ── Inner class con info básica del usuario autenticado ─────────────────
    public static class UsuarioInfo {
        private Long id;
        private String nombre;
        private String email;
        private String rol;
        private String avatarUrl;

        // Vendedor extra
        private Long vendedorId;
        private String nombreTienda;
        private String estadoTienda;

        public UsuarioInfo() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRol() { return rol; }
        public void setRol(String rol) { this.rol = rol; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public Long getVendedorId() { return vendedorId; }
        public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }

        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

        public String getEstadoTienda() { return estadoTienda; }
        public void setEstadoTienda(String estadoTienda) { this.estadoTienda = estadoTienda; }
    }

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, UsuarioInfo usuario) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.usuario = usuario;
    }

    // Getters & Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UsuarioInfo getUsuario() { return usuario; }
    public void setUsuario(UsuarioInfo usuario) { this.usuario = usuario; }
}
