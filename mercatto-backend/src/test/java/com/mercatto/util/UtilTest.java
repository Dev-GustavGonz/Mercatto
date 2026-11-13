package com.mercatto.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class UtilTest {

    @Test
    @DisplayName("TC-20: SlugUtil - Convierte títulos a URLs amigables sin caracteres especiales")
    void testSlugUtil() {
        String titulo = "Auriculares Inalámbricos Sony WH-1000XM5 ¡Edición Especial!";
        String slug = SlugUtil.generar(titulo);

        assertEquals("auriculares-inalambricos-sony-wh-1000xm5-edicion-especial", slug);

        // Prueba con texto nulo o vacío
        String slugVacio = SlugUtil.generar("");
        assertNotNull(slugVacio);
        assertEquals(8, slugVacio.length());

        // Slug único con sufijo
        String slugUnico = SlugUtil.generarUnico("Camisa Lino");
        assertTrue(slugUnico.startsWith("camisa-lino-"));
        assertEquals("camisa-lino-".length() + 6, slugUnico.length());
    }

    @Test
    @DisplayName("TC-21: LocalizationUtil - Traduce categorías al inglés correctamente")
    void testLocalizationUtilCategorias() {
        assertEquals("Technology & Electronics", LocalizationUtil.traducirCategoria("Tecnología y Electrónica"));
        assertEquals("Home & Furniture", LocalizationUtil.traducirCategoria("Hogar y Muebles"));
        assertEquals("Sports & Fitness", LocalizationUtil.traducirCategoria("Deportes y Fitness"));
    }
}
