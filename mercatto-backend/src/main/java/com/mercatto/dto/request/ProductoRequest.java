package com.mercatto.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public class ProductoRequest {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    private Double precio;

    private Double precioOferta;

    @NotNull(message = "El stock es obligatorio")
    private Integer stock;

    private String sku;
    private String marca;
    private String estado = "NUEVO";
    private boolean activo = true;
    private boolean destacado = false;

    private List<ImagenDTO> imagenes;
    private List<VarianteDTO> variantes;

    public ProductoRequest() {}

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }

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

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    public List<ImagenDTO> getImagenes() { return imagenes; }
    public void setImagenes(List<ImagenDTO> imagenes) { this.imagenes = imagenes; }

    public List<VarianteDTO> getVariantes() { return variantes; }
    public void setVariantes(List<VarianteDTO> variantes) { this.variantes = variantes; }

    public static class ImagenDTO {
        private String url;
        private String publicId;
        private boolean principal;
        private Integer ordenVisual;

        public ImagenDTO() {}
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getPublicId() { return publicId; }
        public void setPublicId(String publicId) { this.publicId = publicId; }
        public boolean isPrincipal() { return principal; }
        public void setPrincipal(boolean principal) { this.principal = principal; }
        public Integer getOrdenVisual() { return ordenVisual; }
        public void setOrdenVisual(Integer ordenVisual) { this.ordenVisual = ordenVisual; }
    }

    public static class VarianteDTO {
        private Long id;
        private String nombre;
        private String sku;
        private Double precio;
        private Double precioOferta;
        private Integer stock;
        private String imagenUrl;
        private List<AtributoDTO> atributos;

        public VarianteDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
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
        public List<AtributoDTO> getAtributos() { return atributos; }
        public void setAtributos(List<AtributoDTO> atributos) { this.atributos = atributos; }
    }

    public static class AtributoDTO {
        private String nombre;
        private String valor;

        public AtributoDTO() {}
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getValor() { return valor; }
        public void setValor(String valor) { this.valor = valor; }
    }
}
