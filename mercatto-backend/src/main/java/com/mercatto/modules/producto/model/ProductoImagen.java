package com.mercatto.modules.producto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "producto_imagenes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductoImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonBackReference
    private Producto producto;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(name = "public_id", length = 250)
    private String publicId;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal = false;

    @Column(name = "orden_visual", nullable = false)
    private Integer ordenVisual = 0;

    public ProductoImagen() {}

    public ProductoImagen(Producto producto, String url, boolean esPrincipal, Integer ordenVisual) {
        this.producto = producto;
        this.url = url;
        this.esPrincipal = esPrincipal;
        this.ordenVisual = ordenVisual;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public boolean isEsPrincipal() { return esPrincipal; }
    public void setEsPrincipal(boolean esPrincipal) { this.esPrincipal = esPrincipal; }

    public boolean isPrincipal() { return esPrincipal; }
    public void setPrincipal(boolean principal) { this.esPrincipal = principal; }

    public Integer getOrdenVisual() { return ordenVisual; }
    public void setOrdenVisual(Integer ordenVisual) { this.ordenVisual = ordenVisual; }
}
