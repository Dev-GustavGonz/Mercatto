package com.mercatto.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_CATEGORIAS = "categorias";
    public static final String CACHE_TIENDAS_PUBLICAS = "tiendas_publicas";
    public static final String CACHE_TIENDA_DETALLE = "tienda_detalle";
    public static final String CACHE_PRODUCTOS_DESTACADOS = "productos_destacados";
    public static final String CACHE_PRODUCTOS_MAS_VENDIDOS = "productos_mas_vendidos";
    public static final String CACHE_PRODUCTOS_NUEVOS = "productos_nuevos";
    public static final String CACHE_PRODUCTO_DETALLE = "producto_detalle";
    public static final String CACHE_MARCAS_PUBLICAS = "marcas_publicas";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                CACHE_CATEGORIAS,
                CACHE_TIENDAS_PUBLICAS,
                CACHE_TIENDA_DETALLE,
                CACHE_PRODUCTOS_DESTACADOS,
                CACHE_PRODUCTOS_MAS_VENDIDOS,
                CACHE_PRODUCTOS_NUEVOS,
                CACHE_PRODUCTO_DETALLE,
                CACHE_MARCAS_PUBLICAS
        );

        // Configuración por defecto de Caffeine: expiración a los 10 minutos, máx 1000 entradas
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats());

        return cacheManager;
    }

    /**
     * Filtro HTTP de ETag automático:
     * Si el contenido de la respuesta GET no ha cambiado (hash MD5 idéntico),
     * devuelve HTTP 304 Not Modified con cuerpo vacío, ahorrando ancho de banda y tiempo.
     */
    @Bean
    public FilterRegistrationBean<ShallowEtagHeaderFilter> shallowEtagHeaderFilter() {
        FilterRegistrationBean<ShallowEtagHeaderFilter> filter = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
        filter.addUrlPatterns("/api/*");
        filter.setName("shallowEtagHeaderFilter");
        return filter;
    }
}
