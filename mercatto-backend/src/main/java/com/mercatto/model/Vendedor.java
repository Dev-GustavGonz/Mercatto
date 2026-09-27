package com.mercatto.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendedores")
public class Vendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo = Tipo.PERSONA_NATURAL;

    @Column(name = "nombre_tienda", nullable = false, length = 150)
    private String nombreTienda;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "logo_url")
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.PENDIENTE;

    @Column(name = "nit_cedula", length = 30)
    private String nitCedula;

    @Column(name = "razon_social", length = 200)
    private String razonSocial;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 300)
    private String direccion;

    @Column(name = "cuenta_bancaria", length = 50)
    private String cuentaBancaria;

    @Column(length = 100)
    private String banco;

    @Column
    private Double calificacion = 0.0;

    @Column(name = "total_ventas")
    private Integer totalVentas = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_suscripcion", nullable = false, length = 20)
    private TipoSuscripcion tipoSuscripcion = TipoSuscripcion.STARTER;

    @Column(name = "fecha_expiracion_suscripcion")
    private LocalDateTime fechaExpiracionSuscripcion;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    public Vendedor() {}

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
        // Starter plan expires in 100 years by default (forever free)
        if (tipoSuscripcion == TipoSuscripcion.STARTER && fechaExpiracionSuscripcion == null) {
            fechaExpiracionSuscripcion = LocalDateTime.now().plusYears(100);
        }
    }

    public enum TipoSuscripcion {
        STARTER, PRO, ELITE
    }

    public enum Tipo {
        PERSONA_NATURAL, EMPRESA, PYME
    }

    public enum Estado {
        PENDIENTE, APROBADO, RECHAZADO, SUSPENDIDO
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }

    public String getNombreTienda() { return nombreTienda; }
    public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    public String getNitCedula() { return nitCedula; }
    public void setNitCedula(String nitCedula) { this.nitCedula = nitCedula; }

    public String getRazonSocial() { return razonSocial; }
    public void setRazonSocial(String razonSocial) { this.razonSocial = razonSocial; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCuentaBancaria() { return cuentaBancaria; }
    public void setCuentaBancaria(String cuentaBancaria) { this.cuentaBancaria = cuentaBancaria; }

    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public Integer getTotalVentas() { return totalVentas; }
    public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public TipoSuscripcion getTipoSuscripcion() { return tipoSuscripcion; }
    public void setTipoSuscripcion(TipoSuscripcion tipoSuscripcion) { this.tipoSuscripcion = tipoSuscripcion; }

    public LocalDateTime getFechaExpiracionSuscripcion() { return fechaExpiracionSuscripcion; }
    public void setFechaExpiracionSuscripcion(LocalDateTime fechaExpiracionSuscripcion) { this.fechaExpiracionSuscripcion = fechaExpiracionSuscripcion; }
}
