package com.mercatto.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class PedidoRequest {

    private Long direccionId;

    @JsonAlias({"direccionEntrega", "direccion"})
    private DireccionDTO nuevaDireccion;

    // Campos opcionales para compradores invitados (Guest Checkout)
    @JsonAlias({"email"})
    private String emailInvitado;

    @JsonAlias({"nombre"})
    private String nombreInvitado;

    @JsonAlias({"telefono"})
    private String telefonoInvitado;

    @NotEmpty(message = "El pedido debe contener al menos un producto")
    private List<ItemDTO> items;

    @JsonAlias({"codigoCupon"})
    private String cuponCodigo;

    private String metodoPago = "WOMPI";
    private String notas;

    public PedidoRequest() {}

    public Long getDireccionId() { return direccionId; }
    public void setDireccionId(Long direccionId) { this.direccionId = direccionId; }

    public DireccionDTO getNuevaDireccion() { return nuevaDireccion; }
    public void setNuevaDireccion(DireccionDTO nuevaDireccion) { this.nuevaDireccion = nuevaDireccion; }

    public String getEmailInvitado() { return emailInvitado; }
    public void setEmailInvitado(String emailInvitado) { this.emailInvitado = emailInvitado; }

    public String getNombreInvitado() { return nombreInvitado; }
    public void setNombreInvitado(String nombreInvitado) { this.nombreInvitado = nombreInvitado; }

    public String getTelefonoInvitado() { return telefonoInvitado; }
    public void setTelefonoInvitado(String telefonoInvitado) { this.telefonoInvitado = telefonoInvitado; }

    public List<ItemDTO> getItems() { return items; }
    public void setItems(List<ItemDTO> items) { this.items = items; }

    public String getCuponCodigo() { return cuponCodigo; }
    public void setCuponCodigo(String cuponCodigo) { this.cuponCodigo = cuponCodigo; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public static class ItemDTO {
        @NotNull(message = "El ID del producto es obligatorio")
        private Long productoId;
        private Long varianteId;
        @NotNull(message = "La cantidad es obligatoria")
        private Integer cantidad;

        public ItemDTO() {}
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        public Long getVarianteId() { return varianteId; }
        public void setVarianteId(Long varianteId) { this.varianteId = varianteId; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }

    public static class DireccionDTO {
        @JsonAlias({"nombre", "destinatario"})
        private String nombreCompleto;

        private String telefono;
        private String direccion;
        private String barrio;
        private String ciudad;
        private String departamento;
        private String codigoPostal;

        @JsonAlias({"notas", "detalles", "indicaciones"})
        private String notasEntrega;

        public DireccionDTO() {}
        public String getNombreCompleto() { return nombreCompleto; }
        public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
        public String getBarrio() { return barrio; }
        public void setBarrio(String barrio) { this.barrio = barrio; }
        public String getCiudad() { return ciudad; }
        public void setCiudad(String ciudad) { this.ciudad = ciudad; }
        public String getDepartamento() { return departamento; }
        public void setDepartamento(String departamento) { this.departamento = departamento; }
        public String getCodigoPostal() { return codigoPostal; }
        public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
        public String getNotasEntrega() { return notasEntrega; }
        public void setNotasEntrega(String notasEntrega) { this.notasEntrega = notasEntrega; }
    }
}
