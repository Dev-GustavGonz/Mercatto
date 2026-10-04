package com.mercatto.modules.admin.model;

import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reportante_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario reportante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vendedor vendedor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MotivoReporte motivo = MotivoReporte.OTRO;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReporte estado = EstadoReporte.PENDIENTE;

    @Column(name = "resolucion_admin", columnDefinition = "TEXT")
    private String resolucionAdmin;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    public Reporte() {}

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public enum MotivoReporte {
        PRODUCTO_FALSO, FRAUDE, CONTENIDO_INAPROPIADO, NO_LLEGO_PEDIDO, OTRO
    }

    public enum EstadoReporte {
        PENDIENTE, EN_REVISION, RESUELTO, RECHAZADO
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getReportante() { return reportante; }
    public void setReportante(Usuario reportante) { this.reportante = reportante; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public Vendedor getVendedor() { return vendedor; }
    public void setVendedor(Vendedor vendedor) { this.vendedor = vendedor; }

    public MotivoReporte getMotivo() { return motivo; }
    public void setMotivo(MotivoReporte motivo) { this.motivo = motivo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public EstadoReporte getEstado() { return estado; }
    public void setEstado(EstadoReporte estado) { this.estado = estado; }

    public String getResolucionAdmin() { return resolucionAdmin; }
    public void setResolucionAdmin(String resolucionAdmin) { this.resolucionAdmin = resolucionAdmin; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
