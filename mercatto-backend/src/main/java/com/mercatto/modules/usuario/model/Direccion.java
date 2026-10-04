package com.mercatto.modules.usuario.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "direcciones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario usuario;

    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(nullable = false, length = 250)
    private String direccion;

    @Column(length = 100)
    private String barrio;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(nullable = false, length = 100)
    private String departamento;

    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;

    @Column(name = "notas_entrega", length = 300)
    private String notasEntrega;

    @Column(name = "es_principal", nullable = false)
    private boolean esPrincipal = false;

    public Direccion() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getBarrio() { return barrio; }
    public void setBarrio(String barrio) { this.barrio = barrio; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }

    public String getNotasEntrega() { return notasEntrega; }
    public void setNotasEntrega(String notasEntrega) { this.notasEntrega = notasEntrega; }

    public boolean isEsPrincipal() { return esPrincipal; }
    public void setEsPrincipal(boolean esPrincipal) { this.esPrincipal = esPrincipal; }

    public boolean isPrincipal() { return esPrincipal; }
    public void setPrincipal(boolean principal) { this.esPrincipal = principal; }
}
