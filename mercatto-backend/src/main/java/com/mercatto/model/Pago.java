package com.mercatto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonBackReference
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MetodoPago metodo = MetodoPago.STRIPE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoPago estado = EstadoPago.PENDIENTE;

    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false, length = 10)
    private String moneda = "COP";

    @Column(name = "transaccion_id", length = 200)
    private String transaccionId;

    @Column(name = "pasarela_referencia", length = 200)
    private String pasarelaReferencia;

    @Column(name = "detalles_json", columnDefinition = "TEXT")
    private String detallesJson;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    public Pago() {}

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public enum MetodoPago {
        WOMPI,
        STRIPE,
        TARJETA_CREDITO,
        PSE,
        NEQUI,
        DAVIPLATA,
        TRANSFERENCIA_BANCARIA,
        CONTRA_ENTREGA
    }

    public enum EstadoPago {
        PENDIENTE,
        PROCESANDO,
        APROBADO,
        RECHAZADO,
        REEMBOLSADO
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public MetodoPago getMetodo() { return metodo; }
    public void setMetodo(MetodoPago metodo) { this.metodo = metodo; }

    public EstadoPago getEstado() { return estado; }
    public void setEstado(EstadoPago estado) { this.estado = estado; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }

    public String getTransaccionId() { return transaccionId; }
    public void setTransaccionId(String transaccionId) { this.transaccionId = transaccionId; }

    public String getPasarelaReferencia() { return pasarelaReferencia; }
    public void setPasarelaReferencia(String pasarelaReferencia) { this.pasarelaReferencia = pasarelaReferencia; }

    public String getDetallesJson() { return detallesJson; }
    public void setDetallesJson(String detallesJson) { this.detallesJson = detallesJson; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaConfirmacion() { return fechaConfirmacion; }
    public void setFechaConfirmacion(LocalDateTime fechaConfirmacion) { this.fechaConfirmacion = fechaConfirmacion; }

    public void setFechaPago(LocalDateTime fechaPago) { this.fechaConfirmacion = fechaPago; }
    public LocalDateTime getFechaPago() { return this.fechaConfirmacion; }
}
