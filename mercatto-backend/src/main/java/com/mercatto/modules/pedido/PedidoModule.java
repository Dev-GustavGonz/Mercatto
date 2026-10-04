package com.mercatto.modules.pedido;

import com.mercatto.modules.pedido.controller.PagoController;
import com.mercatto.modules.pedido.controller.PedidoController;
import com.mercatto.modules.pedido.model.CarritoItem;
import com.mercatto.modules.pedido.model.Cupon;
import com.mercatto.modules.pedido.model.Pago;
import com.mercatto.modules.pedido.model.Pedido;
import com.mercatto.modules.pedido.model.PedidoItem;
import com.mercatto.modules.pedido.service.PagoService;
import com.mercatto.modules.pedido.service.PedidoService;
import com.mercatto.modules.pedido.service.StripeService;
import com.mercatto.modules.pedido.service.WompiService;

/**
 * Módulo de Dominio: Pedido, Carrito & Pasarelas de Pago
 * Entidades asociadas: Pedido, PedidoItem, CarritoItem, Pago, Cupon
 * Controladores: PedidoController, CarritoController, PagoController
 * Servicios: PedidoService, CarritoService, PagoService, StripeService, WompiService
 */
public class PedidoModule {
    public static final String DOMAIN = "PEDIDOS_PAGOS";
}
