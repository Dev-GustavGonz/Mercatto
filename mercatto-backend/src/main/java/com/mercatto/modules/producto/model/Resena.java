package com.mercatto.modules.producto.model;

import com.mercatto.modules.usuario.model.Usuario;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resenas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "vendedor", "imagenes", "variantes"})
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;

    @Column(nullable = false)
    private Integer calificacion; // 1 a 5

    @Column(length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "compra_verificada", nullable = false)
    private boolean compraVerificada = false;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    public Resena() {}

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public boolean isCompraVerificada() { return compraVerificada; }
    public void setCompraVerificada(boolean compraVerificada) { this.compraVerificada = compraVerificada; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
