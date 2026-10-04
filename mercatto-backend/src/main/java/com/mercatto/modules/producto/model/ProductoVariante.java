package com.mercatto.modules.producto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "producto_variantes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductoVariante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonBackReference
    private Producto producto;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String sku;

    @Column(nullable = false)
    private Double precio;

    @Column(name = "precio_oferta")
    private Double precioOferta;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(nullable = false)
    private boolean activo = true;

    @OneToMany(mappedBy = "variante", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VarianteAtributo> atributos = new ArrayList<>();

    public ProductoVariante() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }

    public Double getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(Double precioOferta) { this.precioOferta = precioOferta; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public List<VarianteAtributo> getAtributos() { return atributos; }
    public void setAtributos(List<VarianteAtributo> atributos) { this.atributos = atributos; }
}
