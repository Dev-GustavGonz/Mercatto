package com.mercatto.modules.pedido.model;

import com.mercatto.modules.usuario.model.Direccion;
import com.mercatto.modules.usuario.model.Usuario;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario comprador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direccion_id")
    @JsonIgnoreProperties({"usuario", "hibernateLazyInitializer", "handler"})
    private Direccion direccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;

    @Column(nullable = false)
    private Double subtotal = 0.0;

    @Column(nullable = false)
    private Double descuento = 0.0;

    @Column(name = "costo_envio", nullable = false)
    private Double costoEnvio = 0.0;

    @Column(nullable = false)
    private Double total = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cupon_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Cupon cupon;

    @Column(name = "guia_seguimiento", length = 100)
    private String guiaSeguimiento;

    @Column(name = "empresa_envio", length = 100)
    private String empresaEnvio;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PedidoItem> items = new ArrayList<>();

    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Pago pago;

    public Pedido() {}

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public enum EstadoPedido {
        PENDIENTE,
        PAGADO,
        EN_PREPARACION,
        ENVIADO,
        ENTREGADO,
        CANCELADO,
        REEMBOLSADO
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Usuario getComprador() { return comprador; }
    public void setComprador(Usuario comprador) { this.comprador = comprador; }

    public Direccion getDireccion() { return direccion; }
    public void setDireccion(Direccion direccion) { this.direccion = direccion; }

    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDescuento() { return descuento; }
    public void setDescuento(Double descuento) { this.descuento = descuento; }

    public Double getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(Double costoEnvio) { this.costoEnvio = costoEnvio; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Cupon getCupon() { return cupon; }
    public void setCupon(Cupon cupon) { this.cupon = cupon; }

    public String getGuiaSeguimiento() { return guiaSeguimiento; }
    public void setGuiaSeguimiento(String guiaSeguimiento) { this.guiaSeguimiento = guiaSeguimiento; }

    public String getEmpresaEnvio() { return empresaEnvio; }
    public void setEmpresaEnvio(String empresaEnvio) { this.empresaEnvio = empresaEnvio; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public List<PedidoItem> getItems() { return items; }
    public void setItems(List<PedidoItem> items) { this.items = items; }

    public Pago getPago() { return pago; }
    public void setPago(Pago pago) { this.pago = pago; }
}
