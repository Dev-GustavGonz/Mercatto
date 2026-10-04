package com.mercatto.modules.pedido.model;

import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.ProductoVariante;
import com.mercatto.modules.usuario.model.Usuario;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carrito_items")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private ProductoVariante variante;

    @Column(nullable = false)
    private Integer cantidad = 1;

    @Column(name = "fecha_agregado")
    private LocalDateTime fechaAgregado;

    public CarritoItem() {}

    @PrePersist
    protected void onCreate() {
        this.fechaAgregado = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public ProductoVariante getVariante() { return variante; }
    public void setVariante(ProductoVariante variante) { this.variante = variante; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public LocalDateTime getFechaAgregado() { return fechaAgregado; }
    public void setFechaAgregado(LocalDateTime fechaAgregado) { this.fechaAgregado = fechaAgregado; }
}
