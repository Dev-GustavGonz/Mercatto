package com.mercatto.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MensajeRequest {

    @NotNull(message = "El destinatario es obligatorio")
    private Long destinatarioId;

    private Long productoId; // Opcional, por si el chat inicia desde un producto

    @NotBlank(message = "El mensaje no puede estar vacío")
    private String contenido;

    // Campos antiguos requeridos por MensajeContactoService
    private String asunto;
    private String mensaje;
    private Long pedidoId;

    public Long getDestinatarioId() { return destinatarioId; }
    public void setDestinatarioId(Long destinatarioId) { this.destinatarioId = destinatarioId; }

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }
}
