package com.mercatto.util;

import com.mercatto.modules.producto.model.Categoria;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.*;
import java.util.stream.Collectors;

public final class LocalizationUtil {

    private LocalizationUtil() {}

    private static final Map<String, String> CATEGORIAS_ES_TO_EN = new HashMap<>();

    static {
        CATEGORIAS_ES_TO_EN.put("hogar y muebles", "Home & Furniture");
        CATEGORIAS_ES_TO_EN.put("hogar y mueble", "Home & Furniture");
        CATEGORIAS_ES_TO_EN.put("hogar", "Home & Furniture");
        CATEGORIAS_ES_TO_EN.put("muebles", "Furniture");
        CATEGORIAS_ES_TO_EN.put("muebles y hogar", "Home & Furniture");

        CATEGORIAS_ES_TO_EN.put("tecnologia y electronica", "Technology & Electronics");
        CATEGORIAS_ES_TO_EN.put("tecnología y electrónica", "Technology & Electronics");
        CATEGORIAS_ES_TO_EN.put("tecnologia", "Technology");
        CATEGORIAS_ES_TO_EN.put("tecnología", "Technology");
        CATEGORIAS_ES_TO_EN.put("electronica", "Electronics");
        CATEGORIAS_ES_TO_EN.put("electrónica", "Electronics");

        CATEGORIAS_ES_TO_EN.put("moda y calzado", "Fashion & Apparel");
        CATEGORIAS_ES_TO_EN.put("moda y ropa", "Fashion & Apparel");
        CATEGORIAS_ES_TO_EN.put("moda", "Fashion & Apparel");
        CATEGORIAS_ES_TO_EN.put("ropa", "Apparel");
        CATEGORIAS_ES_TO_EN.put("calzado", "Footwear");
        CATEGORIAS_ES_TO_EN.put("calzado deportivo", "Sports Footwear");

        CATEGORIAS_ES_TO_EN.put("deportes y fitness", "Sports & Fitness");
        CATEGORIAS_ES_TO_EN.put("deportes", "Sports");
        CATEGORIAS_ES_TO_EN.put("fitness", "Fitness");

        CATEGORIAS_ES_TO_EN.put("belleza y cuidado personal", "Beauty & Personal Care");
        CATEGORIAS_ES_TO_EN.put("belleza", "Beauty");
        CATEGORIAS_ES_TO_EN.put("cuidado personal", "Personal Care");

        CATEGORIAS_ES_TO_EN.put("herramientas e industrias", "Tools & Industry");
        CATEGORIAS_ES_TO_EN.put("herramientas", "Tools & Hardware");

        CATEGORIAS_ES_TO_EN.put("smartphones y celulares", "Smartphones & Mobile");
        CATEGORIAS_ES_TO_EN.put("celulares", "Smartphones");
        CATEGORIAS_ES_TO_EN.put("computadores y laptops", "Laptops & Computers");
        CATEGORIAS_ES_TO_EN.put("computadores", "Computers");

        CATEGORIAS_ES_TO_EN.put("cocina y electrodomesticos", "Kitchen & Appliances");
        CATEGORIAS_ES_TO_EN.put("cocina y electrodomésticos", "Kitchen & Appliances");
        CATEGORIAS_ES_TO_EN.put("cocina", "Kitchen");
        CATEGORIAS_ES_TO_EN.put("electrodomesticos", "Home Appliances");
        CATEGORIAS_ES_TO_EN.put("electrodomésticos", "Home Appliances");

        CATEGORIAS_ES_TO_EN.put("accesorios", "Accessories");
        CATEGORIAS_ES_TO_EN.put("audio y video", "Audio & Video");
        CATEGORIAS_ES_TO_EN.put("juguetes y bebes", "Toys & Baby");
        CATEGORIAS_ES_TO_EN.put("juguetes y bebés", "Toys & Baby");
        CATEGORIAS_ES_TO_EN.put("juguetes", "Toys");
        CATEGORIAS_ES_TO_EN.put("salud y bienestar", "Health & Wellness");
        CATEGORIAS_ES_TO_EN.put("mascotas", "Pets");
        CATEGORIAS_ES_TO_EN.put("automotriz", "Automotive");
        CATEGORIAS_ES_TO_EN.put("libros y papeleria", "Books & Stationery");
        CATEGORIAS_ES_TO_EN.put("libros y papelería", "Books & Stationery");
    }

    public static boolean isEnglishRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest req = attributes.getRequest();
                String langParam = req.getParameter("lang");
                if (langParam == null) langParam = req.getParameter("idioma");
                if (langParam != null && langParam.toLowerCase().startsWith("en")) {
                    return true;
                }
                String acceptLang = req.getHeader("Accept-Language");
                if (acceptLang != null && acceptLang.toLowerCase().contains("en")) {
                    return true;
                }
            }
        } catch (Exception ignored) {}

        Locale locale = LocaleContextHolder.getLocale();
        return locale != null && locale.getLanguage() != null && locale.getLanguage().equalsIgnoreCase("en");
    }

    public static String traducirCategoria(String nombre) {
        if (nombre == null || nombre.isBlank()) return nombre;
        String clave = nombre.trim().toLowerCase();
        if (CATEGORIAS_ES_TO_EN.containsKey(clave)) {
            return CATEGORIAS_ES_TO_EN.get(clave);
        }
        for (Map.Entry<String, String> entry : CATEGORIAS_ES_TO_EN.entrySet()) {
            if (clave.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return nombre;
    }

    public static Categoria clonarYTraducirCategoria(Categoria c, boolean isEn) {
        if (c == null) return null;
        Categoria copia = new Categoria();
        copia.setId(c.getId());
        copia.setNombre(isEn ? traducirCategoria(c.getNombre()) : c.getNombre());
        copia.setSlug(c.getSlug());
        copia.setDescripcion(c.getDescripcion());
        copia.setIcono(c.getIcono());
        copia.setImagenUrl(c.getImagenUrl());
        copia.setActivo(c.isActivo());
        copia.setOrdenVisual(c.getOrdenVisual());
        if (c.getPadre() != null) {
            Categoria padreCopia = new Categoria();
            padreCopia.setId(c.getPadre().getId());
            padreCopia.setNombre(isEn ? traducirCategoria(c.getPadre().getNombre()) : c.getPadre().getNombre());
            copia.setPadre(padreCopia);
        }
        if (c.getSubcategorias() != null) {
            copia.setSubcategorias(c.getSubcategorias().stream()
                    .map(sub -> clonarYTraducirCategoria(sub, isEn))
                    .collect(Collectors.toList()));
        }
        return copia;
    }

    public static List<Categoria> clonarYTraducirListaCategorias(List<Categoria> lista, boolean isEn) {
        if (lista == null) return Collections.emptyList();
        if (!isEn) return lista;
        return lista.stream()
                .map(c -> clonarYTraducirCategoria(c, true))
                .collect(Collectors.toList());
    }

    public static String msg(String es, String en) {
        return isEnglishRequest() ? en : es;
    }
}
