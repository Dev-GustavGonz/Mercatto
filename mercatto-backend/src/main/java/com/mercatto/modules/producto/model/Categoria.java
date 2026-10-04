package com.mercatto.modules.producto.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categorias")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String descripcion;

    @Column(length = 100)
    private String icono; // Lucide icon name or image url

    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "orden_visual")
    private Integer ordenVisual = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "padre_id")
    @JsonIgnoreProperties({"subcategorias", "padre"})
    private Categoria padre;

    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"padre"})
    private List<Categoria> subcategorias = new ArrayList<>();

    public Categoria() {}

    public Categoria(Long id, String nombre, String slug, String descripcion, String icono, String imagenUrl, boolean activo, Integer ordenVisual, Categoria padre, List<Categoria> subcategorias) {
        this.id = id;
        this.nombre = nombre;
        this.slug = slug;
        this.descripcion = descripcion;
        this.icono = icono;
        this.imagenUrl = imagenUrl;
        this.activo = activo;
        this.ordenVisual = ordenVisual;
        this.padre = padre;
        this.subcategorias = subcategorias != null ? subcategorias : new ArrayList<>();
    }

    // Getters y Setters explícitos
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public Integer getOrdenVisual() { return ordenVisual; }
    public void setOrdenVisual(Integer ordenVisual) { this.ordenVisual = ordenVisual; }

    public Categoria getPadre() { return padre; }
    public void setPadre(Categoria padre) { this.padre = padre; }

    public List<Categoria> getSubcategorias() { return subcategorias; }
    public void setSubcategorias(List<Categoria> subcategorias) { this.subcategorias = subcategorias; }
}
