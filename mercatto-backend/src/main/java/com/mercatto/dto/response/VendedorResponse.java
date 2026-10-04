package com.mercatto.dto.response;

import java.time.LocalDateTime;

public class VendedorResponse {
    private Long id;
    private Long usuarioId;
    private String email;
    private String nombrePropietario;
    private String nombreTienda;
    private String descripcion;
    private String logoUrl;
    private String portadaUrl;
    private String tipo;
    private String estado;
    private String nitCedula;
    private String razonSocial;
    private String ciudad;
    private String direccion;
    private Double calificacion;
    private Integer totalVentas;
    private Double ingresosTotales;
    private Double ventasBrutas;
    private Double comisionAdmin;
    private Double pagoNetoVendedor;
    private String banco;
    private String cuentaBancaria;
    private LocalDateTime fechaRegistro;
    private String tipoSuscripcion;
    private LocalDateTime fechaExpiracionSuscripcion;

    public VendedorResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNombrePropietario() { return nombrePropietario; }
    public void setNombrePropietario(String nombrePropietario) { this.nombrePropietario = nombrePropietario; }

    public String getNombreTienda() { return nombreTienda; }
    public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getPortadaUrl() { return portadaUrl; }
    public void setPortadaUrl(String portadaUrl) { this.portadaUrl = portadaUrl; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getNitCedula() { return nitCedula; }
    public void setNitCedula(String nitCedula) { this.nitCedula = nitCedula; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public Integer getTotalVentas() { return totalVentas; }
    public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas; }

    public Double getIngresosTotales() { return ingresosTotales; }
    public void setIngresosTotales(Double ingresosTotales) { this.ingresosTotales = ingresosTotales; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getTipoSuscripcion() { return tipoSuscripcion; }
    public void setTipoSuscripcion(String tipoSuscripcion) { this.tipoSuscripcion = tipoSuscripcion; }

    public Double getVentasBrutas() { return ventasBrutas; }
    public void setVentasBrutas(Double ventasBrutas) { this.ventasBrutas = ventasBrutas; }

    public Double getComisionAdmin() { return comisionAdmin; }
    public void setComisionAdmin(Double comisionAdmin) { this.comisionAdmin = comisionAdmin; }

    public Double getPagoNetoVendedor() { return pagoNetoVendedor; }
    public void setPagoNetoVendedor(Double pagoNetoVendedor) { this.pagoNetoVendedor = pagoNetoVendedor; }

    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }

    public String getCuentaBancaria() { return cuentaBancaria; }
    public void setCuentaBancaria(String cuentaBancaria) { this.cuentaBancaria = cuentaBancaria; }

    public LocalDateTime getFechaExpiracionSuscripcion() { return fechaExpiracionSuscripcion; }
    public void setFechaExpiracionSuscripcion(LocalDateTime fechaExpiracionSuscripcion) { this.fechaExpiracionSuscripcion = fechaExpiracionSuscripcion; }
}
