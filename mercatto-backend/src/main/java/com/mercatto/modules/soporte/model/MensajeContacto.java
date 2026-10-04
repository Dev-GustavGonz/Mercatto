package com.mercatto.modules.soporte.model;

import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.vendedor.model.Vendedor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes_contacto")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MensajeContacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "vendedor", "imagenes", "variantes"})
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comprador_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private Usuario comprador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "usuario"})
    private Vendedor vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "items", "pago"})
    private Pedido pedido;

    @Column(length = 200)
    private String asunto;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(name = "es_de_comprador", nullable = false)
    private boolean esDeComprador = true;

    @Column(nullable = false)
    private boolean leido = false;

    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;

    public MensajeContacto() {}

    @PrePersist
    protected void onCreate() {
        this.fechaEnvio = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

    public Usuario getComprador() { return comprador; }
    public void setComprador(Usuario comprador) { this.comprador = comprador; }

    public Vendedor getVendedor() { return vendedor; }
    public void setVendedor(Vendedor vendedor) { this.vendedor = vendedor; }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public boolean isEsDeComprador() { return esDeComprador; }
    public void setEsDeComprador(boolean esDeComprador) { this.esDeComprador = esDeComprador; }

    public boolean isLeido() { return leido; }
    public void setLeido(boolean leido) { this.leido = leido; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }

    public LocalDateTime getFechaLectura() { return fechaLectura; }
    public void setFechaLectura(LocalDateTime fechaLectura) { this.fechaLectura = fechaLectura; }
}
