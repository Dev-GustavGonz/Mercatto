package com.mercatto.modules.producto;

import com.mercatto.modules.producto.controller.CategoriaController;
import com.mercatto.modules.producto.controller.FavoritoController;
import com.mercatto.modules.producto.controller.ProductoController;
import com.mercatto.modules.producto.controller.ResenaController;
import com.mercatto.modules.producto.model.Categoria;
import com.mercatto.modules.producto.model.Favorito;
import com.mercatto.modules.producto.model.Producto;
import com.mercatto.modules.producto.model.ProductoImagen;
import com.mercatto.modules.producto.model.ProductoVariante;
import com.mercatto.modules.producto.model.Resena;
import com.mercatto.modules.producto.model.VarianteAtributo;
import com.mercatto.modules.producto.service.ProductoService;

/**
 * Módulo de Dominio: Producto & Catálogo
 * Entidades asociadas: Producto, Categoria, ProductoImagen, ProductoVariante, VarianteAtributo, Favorito, Resena
 * Controladores: ProductoController, CategoriaController, FavoritoController, ResenaController
 * Servicios: ProductoService
 */
public class ProductoModule {
    public static final String DOMAIN = "PRODUCTO_CATALOGO";
}
