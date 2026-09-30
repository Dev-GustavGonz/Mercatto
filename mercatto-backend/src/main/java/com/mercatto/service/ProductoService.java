package com.mercatto.service;

import com.mercatto.dto.request.ProductoRequest;
import com.mercatto.dto.response.ProductoResponse;
import com.mercatto.exception.BadRequestException;
import com.mercatto.exception.ResourceNotFoundException;
import com.mercatto.exception.UnauthorizedException;
import com.mercatto.model.*;
import com.mercatto.repository.CategoriaRepository;
import com.mercatto.repository.ProductoImagenRepository;
import com.mercatto.repository.ProductoRepository;
import com.mercatto.repository.VarianteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    @Autowired private ProductoRepository productoRepo;
    @Autowired private CategoriaRepository categoriaRepo;
    @Autowired private ProductoImagenRepository imagenRepo;
    @Autowired private VarianteRepository varianteRepo;

    public Page<ProductoResponse> listar(Long categoriaId, String marca, Double precioMin, Double precioMax,
                                        String termino, int pagina, int tamano, String orden) {
        Sort sort = Sort.by(Sort.Direction.DESC, "fechaCreacion");
        if ("precio_asc".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.ASC, "precio");
        } else if ("precio_desc".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "precio");
        } else if ("calificacion".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "calificacion");
        } else if ("ventas".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "totalVentas");
        }

        Pageable pageable = PageRequest.of(pagina, tamano, sort);
        Page<Producto> productos = productoRepo.filtrarCatalogo(categoriaId, marca, precioMin, precioMax, termino, pageable);
        return productos.map(this::convertirAResponse);
    }

    public Page<ProductoResponse> filtrarPorTienda(Long vendedorId, Long categoriaId, String marca,
                                                  Double precioMin, Double precioMax, String termino,
                                                  int pagina, int tamano, String orden) {
        Sort sort = Sort.by(Sort.Direction.DESC, "fechaCreacion");
        if ("precio_asc".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.ASC, "precio");
        } else if ("precio_desc".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "precio");
        } else if ("calificacion".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "calificacion");
        } else if ("ventas".equalsIgnoreCase(orden)) {
            sort = Sort.by(Sort.Direction.DESC, "totalVentas");
        }

        Pageable pageable = PageRequest.of(pagina, tamano, sort);
        Page<Producto> productos = productoRepo.filtrarPorTienda(vendedorId, categoriaId, marca, precioMin, precioMax, termino, pageable);
        return productos.map(this::convertirAResponse);
    }

    public List<ProductoResponse> obtenerDestacados() {
        return productoRepo.findTop8ByDestacadoTrueAndActivoTrueOrderByTotalVentasDesc()
                .stream().map(this::convertirAResponse).collect(Collectors.toList());
    }

    public List<ProductoResponse> obtenerNuevos() {
        return productoRepo.findTop8ByActivoTrueOrderByFechaCreacionDesc()
                .stream().map(this::convertirAResponse).collect(Collectors.toList());
    }

    public ProductoResponse obtenerPorId(Long id) {
        Producto producto = productoRepo.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no disponible o inactivo"));
        return convertirAResponse(producto);
    }

    public ProductoResponse obtenerPorSlug(String slug) {
        Producto producto = productoRepo.findBySlugAndActivoTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        return convertirAResponse(producto);
    }

    public Page<ProductoResponse> listarPorVendedor(Vendedor vendedor, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        return productoRepo.findByVendedor(vendedor, pageable).map(this::convertirAResponse);
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request, Vendedor vendedor) {
        Categoria categoria = categoriaRepo.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no válida"));

        Producto producto = new Producto();
        producto.setVendedor(vendedor);
        producto.setCategoria(categoria);
        producto.setTitulo(request.getTitulo());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setPrecioOferta(request.getPrecioOferta());
        producto.setStock(request.getStock());
        producto.setSku(request.getSku() != null ? request.getSku() : "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        producto.setMarca(request.getMarca());
        if (request.getEstado() != null) {
            try {
                producto.setEstado(Producto.EstadoProducto.valueOf(request.getEstado().toUpperCase()));
            } catch (Exception ignored) {}
        }
        producto.setActivo(request.isActivo());
        producto.setDestacado(request.isDestacado());

        String slug = generarSlugUnico(request.getTitulo());
        producto.setSlug(slug);

        Producto guardado = productoRepo.save(producto);

        // Guardar imágenes
        if (request.getImagenes() != null && !request.getImagenes().isEmpty()) {
            List<ProductoImagen> imagenes = new ArrayList<>();
            for (int i = 0; i < request.getImagenes().size(); i++) {
                ProductoRequest.ImagenDTO imgDto = request.getImagenes().get(i);
                ProductoImagen img = new ProductoImagen();
                img.setProducto(guardado);
                img.setUrl(imgDto.getUrl());
                img.setPublicId(imgDto.getPublicId());
                img.setPrincipal(i == 0 || imgDto.isPrincipal());
                img.setOrdenVisual(imgDto.getOrdenVisual() != null ? imgDto.getOrdenVisual() : i);
                imagenes.add(img);
            }
            imagenRepo.saveAll(imagenes);
            guardado.setImagenes(imagenes);
        }

        // Guardar variantes
        if (request.getVariantes() != null && !request.getVariantes().isEmpty()) {
            List<ProductoVariante> variantes = new ArrayList<>();
            for (ProductoRequest.VarianteDTO varDto : request.getVariantes()) {
                ProductoVariante v = new ProductoVariante();
                v.setProducto(guardado);
                v.setNombre(varDto.getNombre());
                v.setSku(varDto.getSku());
                v.setPrecio(varDto.getPrecio() != null ? varDto.getPrecio() : guardado.getPrecio());
                v.setPrecioOferta(varDto.getPrecioOferta());
                v.setStock(varDto.getStock() != null ? varDto.getStock() : 0);
                v.setImagenUrl(varDto.getImagenUrl());

                if (varDto.getAtributos() != null) {
                    List<VarianteAtributo> atributos = new ArrayList<>();
                    for (ProductoRequest.AtributoDTO atrDto : varDto.getAtributos()) {
                        VarianteAtributo atr = new VarianteAtributo();
                        atr.setVariante(v);
                        atr.setNombre(atrDto.getNombre());
                        atr.setValor(atrDto.getValor());
                        atributos.add(atr);
                    }
                    v.setAtributos(atributos);
                }
                variantes.add(v);
            }
            varianteRepo.saveAll(variantes);
            guardado.setVariantes(variantes);
        }

        return convertirAResponse(guardado);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request, Vendedor vendedor) {
        Producto producto = productoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (!producto.getVendedor().getId().equals(vendedor.getId())) {
            throw new UnauthorizedException("No tienes permiso para editar este producto.");
        }

        Categoria categoria = categoriaRepo.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no válida"));

        producto.setCategoria(categoria);
        producto.setTitulo(request.getTitulo());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setPrecioOferta(request.getPrecioOferta());
        producto.setStock(request.getStock());
        producto.setMarca(request.getMarca());
        producto.setActivo(request.isActivo());
        producto.setDestacado(request.isDestacado());

        // Actualizar imágenes si se enviaron
        if (request.getImagenes() != null) {
            imagenRepo.deleteByProducto(producto);
            List<ProductoImagen> nuevasImagenes = new ArrayList<>();
            for (int i = 0; i < request.getImagenes().size(); i++) {
                ProductoRequest.ImagenDTO imgDto = request.getImagenes().get(i);
                ProductoImagen img = new ProductoImagen();
                img.setProducto(producto);
                img.setUrl(imgDto.getUrl());
                img.setPublicId(imgDto.getPublicId());
                img.setPrincipal(i == 0 || imgDto.isPrincipal());
                img.setOrdenVisual(i);
                nuevasImagenes.add(img);
            }
            imagenRepo.saveAll(nuevasImagenes);
            producto.setImagenes(nuevasImagenes);
        }

        return convertirAResponse(productoRepo.save(producto));
    }

    @Transactional
    public void eliminar(Long id, Vendedor vendedor) {
        Producto producto = productoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (!producto.getVendedor().getId().equals(vendedor.getId())) {
            throw new UnauthorizedException("No tienes permiso para eliminar este producto.");
        }

        producto.setActivo(false);
        productoRepo.save(producto);
    }

    @Transactional
    public ProductoResponse toggleActivo(Long id, Vendedor vendedor) {
        Producto producto = productoRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (!producto.getVendedor().getId().equals(vendedor.getId())) {
            throw new UnauthorizedException("No tienes permiso para modificar este producto.");
        }

        producto.setActivo(!producto.isActivo());
        return convertirAResponse(productoRepo.save(producto));
    }

    public ProductoResponse convertirAResponse(Producto p) {
        ProductoResponse res = new ProductoResponse();
        res.setId(p.getId());
        res.setTitulo(p.getTitulo());
        res.setSlug(p.getSlug());
        res.setDescripcion(p.getDescripcion());
        res.setPrecio(p.getPrecio());
        res.setPrecioOferta(p.getPrecioOferta());
        res.setStock(p.getStock());
        res.setSku(p.getSku());
        res.setMarca(p.getMarca());
        res.setEstado(p.getEstado() != null ? p.getEstado().name() : "NUEVO");
        res.setActivo(p.isActivo());
        res.setDestacado(p.isDestacado());
        res.setCalificacion(p.getCalificacion());
        res.setTotalResenas(p.getTotalResenas());
        res.setTotalVentas(p.getTotalVentas());
        res.setFechaCreacion(p.getFechaCreacion());

        if (p.getCategoria() != null) {
            ProductoResponse.CategoriaDTO catDto = new ProductoResponse.CategoriaDTO();
            catDto.setId(p.getCategoria().getId());
            catDto.setNombre(p.getCategoria().getNombre());
            catDto.setSlug(p.getCategoria().getSlug());
            catDto.setIcono(p.getCategoria().getIcono());
            res.setCategoria(catDto);
        }

        if (p.getVendedor() != null) {
            ProductoResponse.VendedorDTO vDto = new ProductoResponse.VendedorDTO();
            vDto.setId(p.getVendedor().getId());
            if (p.getVendedor().getUsuario() != null) {
                vDto.setUsuarioId(p.getVendedor().getUsuario().getId());
            } else {
                vDto.setUsuarioId(p.getVendedor().getId());
            }
            vDto.setNombreTienda(p.getVendedor().getNombreTienda());
            vDto.setLogoUrl(p.getVendedor().getLogoUrl());
            vDto.setCiudad(p.getVendedor().getCiudad());
            vDto.setCalificacion(p.getVendedor().getCalificacion());
            res.setVendedor(vDto);
        }

        if (p.getImagenes() != null) {
            res.setImagenes(p.getImagenes().stream().map(img -> {
                ProductoResponse.ImagenDTO dto = new ProductoResponse.ImagenDTO();
                dto.setId(img.getId());
                dto.setUrl(img.getUrl());
                dto.setPrincipal(img.isPrincipal());
                dto.setOrdenVisual(img.getOrdenVisual());
                return dto;
            }).collect(Collectors.toList()));
        }

        if (p.getVariantes() != null) {
            res.setVariantes(p.getVariantes().stream().map(v -> {
                ProductoResponse.VarianteDTO dto = new ProductoResponse.VarianteDTO();
                dto.setId(v.getId());
                dto.setNombre(v.getNombre());
                dto.setSku(v.getSku());
                dto.setPrecio(v.getPrecio());
                dto.setPrecioOferta(v.getPrecioOferta());
                dto.setStock(v.getStock());
                dto.setImagenUrl(v.getImagenUrl());
                return dto;
            }).collect(Collectors.toList()));
        }

        return res;
    }

    private String generarSlugUnico(String titulo) {
        String base = Normalizer.normalize(titulo, Normalizer.Form.NFD)
                .replaceAll("[^\\w\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toLowerCase(Locale.ENGLISH);

        String slug = base;
        int count = 1;
        while (productoRepo.existsBySlug(slug)) {
            slug = base + "-" + count;
            count++;
        }
        return slug;
    }
}
