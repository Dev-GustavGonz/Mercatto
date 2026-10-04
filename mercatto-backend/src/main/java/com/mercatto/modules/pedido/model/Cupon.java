package com.mercatto.modules.pedido.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(length = 200)
    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCupon tipo = TipoCupon.PORCENTAJE;

    @Column(nullable = false)
    private Double valor;

    @Column(name = "monto_minimo", nullable = false)
    private Double montoMinimo = 0.0;

    @Column(name = "descuento_maximo")
    private Double descuentoMaximo;

    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "usos_actuales", nullable = false)
    private Integer usosActuales = 0;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(nullable = false)
    private boolean activo = true;

    public Cupon() {}

    public enum TipoCupon {
        PORCENTAJE,
        MONTO_FIJO
    }

    public boolean esValido() {
        if (!activo) return false;
        LocalDateTime ahora = LocalDateTime.now();
        if (fechaInicio != null && ahora.isBefore(fechaInicio)) return false;
        if (fechaFin != null && ahora.isAfter(fechaFin)) return false;
        if (usosMaximos != null && usosActuales >= usosMaximos) return false;
        return true;
    }

    public boolean esValidoParaMonto(double monto) {
        if (!esValido()) return false;
        return montoMinimo == null || monto >= montoMinimo;
    }

    public double calcularDescuento(double subtotal) {
        if (!esValidoParaMonto(subtotal)) return 0.0;
        double desc = 0.0;
        if (tipo == TipoCupon.PORCENTAJE) {
            desc = subtotal * (valor / 100.0);
            if (descuentoMaximo != null && desc > descuentoMaximo) {
                desc = descuentoMaximo;
            }
        } else if (tipo == TipoCupon.MONTO_FIJO) {
            desc = Math.min(valor, subtotal);
        }
        return desc;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public TipoCupon getTipo() { return tipo; }
    public void setTipo(TipoCupon tipo) { this.tipo = tipo; }

    public Double getValor() { return valor; }
    public void setValor(Double valor) { this.valor = valor; }

    public Double getMontoMinimo() { return montoMinimo; }
    public void setMontoMinimo(Double montoMinimo) { this.montoMinimo = montoMinimo; }

    public Double getDescuentoMaximo() { return descuentoMaximo; }
    public void setDescuentoMaximo(Double descuentoMaximo) { this.descuentoMaximo = descuentoMaximo; }

    public Integer getUsosMaximos() { return usosMaximos; }
    public void setUsosMaximos(Integer usosMaximos) { this.usosMaximos = usosMaximos; }

    public Integer getUsosActuales() { return usosActuales; }
    public void setUsosActuales(Integer usosActuales) { this.usosActuales = usosActuales; }

    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDateTime getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDateTime fechaFin) { this.fechaFin = fechaFin; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
