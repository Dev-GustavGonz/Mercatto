package com.mercatto.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class PedidoResponse {
    private Long id;
    private String codigo;
    private String estado;
    private Double subtotal;
    private Double descuento;
    private Double costoEnvio;
    private Double total;
    private String metodoPago;
    private String estadoPago;
    private String guiaSeguimiento;
    private String empresaEnvio;
    private String evidenciaEntregaUrl;
    private String notas;
    private String nombreTienda;
    private Long vendedorId;
    private LocalDateTime fechaCreacion;

    private Double montoComision;
    private Double netoVendedor;
    private String estadoDesembolso;

    private CompradorDTO comprador;
    private DireccionDTO direccion;
    private List<ItemDTO> items;

    public PedidoResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDescuento() { return descuento; }
    public void setDescuento(Double descuento) { this.descuento = descuento; }

    public Double getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(Double costoEnvio) { this.costoEnvio = costoEnvio; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public String getGuiaSeguimiento() { return guiaSeguimiento; }
    public void setGuiaSeguimiento(String guiaSeguimiento) { this.guiaSeguimiento = guiaSeguimiento; }

    public String getEmpresaEnvio() { return empresaEnvio; }
    public void setEmpresaEnvio(String empresaEnvio) { this.empresaEnvio = empresaEnvio; }

    public String getEvidenciaEntregaUrl() { return evidenciaEntregaUrl; }
    public void setEvidenciaEntregaUrl(String evidenciaEntregaUrl) { this.evidenciaEntregaUrl = evidenciaEntregaUrl; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public String getNombreTienda() { return nombreTienda; }
    public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

    public Long getVendedorId() { return vendedorId; }
    public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Double getMontoComision() { return montoComision; }
    public void setMontoComision(Double montoComision) { this.montoComision = montoComision; }

    public Double getNetoVendedor() { return netoVendedor; }
    public void setNetoVendedor(Double netoVendedor) { this.netoVendedor = netoVendedor; }

    public String getEstadoDesembolso() { return estadoDesembolso; }
    public void setEstadoDesembolso(String estadoDesembolso) { this.estadoDesembolso = estadoDesembolso; }

    public CompradorDTO getComprador() { return comprador; }
    public void setComprador(CompradorDTO comprador) { this.comprador = comprador; }

    public DireccionDTO getDireccion() { return direccion; }
    public void setDireccion(DireccionDTO direccion) { this.direccion = direccion; }

    public List<ItemDTO> getItems() { return items; }
    public void setItems(List<ItemDTO> items) { this.items = items; }

    public static class CompradorDTO {
        private Long id;
        private String nombre;
        private String email;

        public CompradorDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class DireccionDTO {
        private String nombreCompleto;
        private String telefono;
        private String direccion;
        private String barrio;
        private String ciudad;
        private String departamento;
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
        public String getNotasEntrega() { return notasEntrega; }
        public void setNotasEntrega(String notasEntrega) { this.notasEntrega = notasEntrega; }
    }

    public static class ItemDTO {
        private Long id;
        private Long productoId;
        private String nombreProducto;
        private String nombreVariante;
        private String imagenUrl;
        private Double precioUnitario;
        private Integer cantidad;
        private Double subtotal;
        private String nombreTienda;
        private Long vendedorId;

        // Snapshot de comisión según plan al momento de la compra
        private String planVendedor;
        private Double porcentajeComision;
        private Double montoComision;
        private Double netoVendedor;

        public ItemDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductoId() { return productoId; }
        public void setProductoId(Long productoId) { this.productoId = productoId; }
        public String getNombreProducto() { return nombreProducto; }
        public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }
        public String getNombreVariante() { return nombreVariante; }
        public void setNombreVariante(String nombreVariante) { this.nombreVariante = nombreVariante; }
        public String getImagenUrl() { return imagenUrl; }
        public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }
        public Double getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(Double precioUnitario) { this.precioUnitario = precioUnitario; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public Double getSubtotal() { return subtotal; }
        public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }
        public Long getVendedorId() { return vendedorId; }
        public void setVendedorId(Long vendedorId) { this.vendedorId = vendedorId; }

        public String getPlanVendedor() { return planVendedor; }
        public void setPlanVendedor(String planVendedor) { this.planVendedor = planVendedor; }
        public Double getPorcentajeComision() { return porcentajeComision; }
        public void setPorcentajeComision(Double porcentajeComision) { this.porcentajeComision = porcentajeComision; }
        public Double getMontoComision() { return montoComision; }
        public void setMontoComision(Double montoComision) { this.montoComision = montoComision; }
        public Double getNetoVendedor() { return netoVendedor; }
        public void setNetoVendedor(Double netoVendedor) { this.netoVendedor = netoVendedor; }
    }
}
