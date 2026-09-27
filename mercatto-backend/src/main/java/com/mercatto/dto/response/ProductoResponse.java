package com.mercatto.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class ProductoResponse {
    private Long id;
    private String titulo;
    private String slug;
    private String descripcion;
    private Double precio;
    private Double precioOferta;
    private Integer stock;
    private String sku;
    private String marca;
    private String estado;
    private boolean activo;
    private boolean destacado;
    private Double calificacion;
    private Integer totalResenas;
    private Integer totalVentas;
    private LocalDateTime fechaCreacion;

    private CategoriaDTO categoria;
    private VendedorDTO vendedor;
    private List<ImagenDTO> imagenes;
    private List<VarianteDTO> variantes;

    public ProductoResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public boolean isDestacado() { return destacado; }
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    public Double getCalificacion() { return calificacion; }
    public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }

    public Integer getTotalResenas() { return totalResenas; }
    public void setTotalResenas(Integer totalResenas) { this.totalResenas = totalResenas; }

    public Integer getTotalVentas() { return totalVentas; }
    public void setTotalVentas(Integer totalVentas) { this.totalVentas = totalVentas; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public CategoriaDTO getCategoria() { return categoria; }
    public void setCategoria(CategoriaDTO categoria) { this.categoria = categoria; }

    public VendedorDTO getVendedor() { return vendedor; }
    public void setVendedor(VendedorDTO vendedor) { this.vendedor = vendedor; }

    public List<ImagenDTO> getImagenes() { return imagenes; }
    public void setImagenes(List<ImagenDTO> imagenes) { this.imagenes = imagenes; }

    public List<VarianteDTO> getVariantes() { return variantes; }
    public void setVariantes(List<VarianteDTO> variantes) { this.variantes = variantes; }

    public static class CategoriaDTO {
        private Long id;
        private String nombre;
        private String slug;
        private String icono;

        public CategoriaDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getIcono() { return icono; }
        public void setIcono(String icono) { this.icono = icono; }
    }

    public static class VendedorDTO {
        private Long id;
        private Long usuarioId;
        private String nombreTienda;
        private String logoUrl;
        private String ciudad;
        private Double calificacion;

        public VendedorDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUsuarioId() { return usuarioId; }
        public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
        public String getNombreTienda() { return nombreTienda; }
        public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }
        public String getLogoUrl() { return logoUrl; }
        public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
        public String getCiudad() { return ciudad; }
        public void setCiudad(String ciudad) { this.ciudad = ciudad; }
        public Double getCalificacion() { return calificacion; }
        public void setCalificacion(Double calificacion) { this.calificacion = calificacion; }
    }

    public static class ImagenDTO {
        private Long id;
        private String url;
        private boolean principal;
        private Integer ordenVisual;

        public ImagenDTO() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
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
    }
}
