package com.mercatto.modules.soporte;

import com.mercatto.modules.soporte.controller.MensajeContactoController;
import com.mercatto.modules.soporte.controller.MensajeController;
import com.mercatto.modules.soporte.controller.SoporteController;
import com.mercatto.modules.soporte.model.Mensaje;
import com.mercatto.modules.soporte.model.MensajeContacto;
import com.mercatto.modules.soporte.model.TicketSoporte;
import com.mercatto.modules.soporte.service.EmailService;
import com.mercatto.modules.soporte.service.MensajeContactoService;
import com.mercatto.modules.soporte.service.SoporteService;

/**
 * Módulo de Dominio: Soporte, Mensajes y Tickets
 * Entidades asociadas: TicketSoporte, Mensaje, MensajeContacto
 * Controladores: SoporteController, MensajeController, MensajeContactoController
 * Servicios: SoporteService, MensajeService, MensajeContactoService, EmailService
 */
public class SoporteModule {
    public static final String DOMAIN = "SOPORTE_COMUNICACION";
}
