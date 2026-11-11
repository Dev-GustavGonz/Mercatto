package com.mercatto.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegistroRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Ingresa un correo válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    private String password;

    /** ROL: COMPRADOR | VENDEDOR */
    private String rol = "COMPRADOR";

    /** Solo obligatorio si rol == VENDEDOR */
    private DatosVendedorRequest vendedor;

    // ── Inner DTO para datos de tienda ──────────────────────────────────────
    public static class DatosVendedorRequest {
        private String nombreTienda;
        private String nitCedula;
        private String ciudad;
        private String tipo; // PERSONA_NATURAL | EMPRESA | PYME
        private String banco;
        private String cuentaBancaria;

        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

        public String getNitCedula() { return nitCedula; }
        public void setNitCedula(String nitCedula) { this.nitCedula = nitCedula; }

        public String getCiudad() { return ciudad; }
        public void setCiudad(String ciudad) { this.ciudad = ciudad; }

        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }

        public String getBanco() { return banco; }
        public void setBanco(String banco) { this.banco = banco; }

        public String getCuentaBancaria() { return cuentaBancaria; }
        public void setCuentaBancaria(String cuentaBancaria) { this.cuentaBancaria = cuentaBancaria; }
    }

    // Constructors
    public RegistroRequest() {}

    // Getters & Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public DatosVendedorRequest getVendedor() { return vendedor; }
    public void setVendedor(DatosVendedorRequest vendedor) { this.vendedor = vendedor; }
}
