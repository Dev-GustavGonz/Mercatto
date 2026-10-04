package com.mercatto.modules.producto.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "variante_atributos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VarianteAtributo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variante_id", nullable = false)
    @JsonBackReference
    private ProductoVariante variante;

    @Column(nullable = false, length = 50)
    private String nombre; // e.g. Talla, Color, Memoria

    @Column(nullable = false, length = 100)
    private String valor; // e.g. XL, Azul Marino, 128GB

    public VarianteAtributo() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductoVariante getVariante() { return variante; }
    public void setVariante(ProductoVariante variante) { this.variante = variante; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}
