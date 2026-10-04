package com.mercatto.modules.producto.model;

import com.mercatto.modules.vendedor.model.Vendedor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    @JsonIgnoreProperties({"usuario", "hibernateLazyInitializer", "handler"})
    private Vendedor vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonIgnoreProperties({"subcategorias", "padre", "hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    @Column(name = "precio_oferta")
    private Double precioOferta;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(length = 100)
    private String sku;

    @Column(length = 100)
    private String marca;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private EstadoProducto estado = EstadoProducto.NUEVO;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(nullable = false)
    private boolean destacado = false;

    @Column
    private Double calificacion = 0.0;

    @Column(name = "total_resenas")
    private Integer totalResenas = 0;

    @Column(name = "total_ventas")
    private Integer totalVentas = 0;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProductoImagen> imagenes = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ProductoVariante> variantes = new ArrayList<>();

    public Producto() {}

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public enum EstadoProducto {
        NUEVO, USADO, REACONDICIONADO
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vendedor getVendedor() { return vendedor; }
    public void setVendedor(Vendedor vendedor) { this.vendedor = vendedor; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public Double getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(Double precioOferta) { this.precioOferta = precioOferta; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }

    public EstadoProducto getEstado() { return estado; }
    public void setEstado(EstadoProducto estado) { this.estado = estado; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public Integer getTotalResenas() { return totalResenas; }
    public void setTotalResenas(Integer totalResenas) { this.totalResenas = totalResenas; }

    public Integer getTotalVentas() { return totalVentas != null ? totalVentas : 0; }
    public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas != null ? totalVentas : 0; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public List<ProductoImagen> getImagenes() { return imagenes; }
    public void setImagenes(List<ProductoImagen> imagenes) { this.imagenes = imagenes; }

    public List<ProductoVariante> getVariantes() { return variantes; }
    public void setVariantes(List<ProductoVariante> variantes) { this.variantes = variantes; }
}
