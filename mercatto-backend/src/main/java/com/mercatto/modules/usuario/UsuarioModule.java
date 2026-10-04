package com.mercatto.modules.usuario;

import com.mercatto.modules.usuario.controller.AuthController;
import com.mercatto.modules.usuario.controller.DireccionController;
import com.mercatto.modules.usuario.controller.UsuarioController;
import com.mercatto.modules.usuario.model.Direccion;
import com.mercatto.modules.usuario.model.RefreshToken;
import com.mercatto.modules.usuario.model.Usuario;
import com.mercatto.modules.usuario.service.AuthService;
import com.mercatto.modules.usuario.service.GoogleTokenService;

/**
 * Módulo de Dominio: Usuario, Autenticación, Perfil & Direcciones
 * Entidades asociadas: Usuario, Direccion, RefreshToken
 * Controladores: AuthController, UsuarioController, DireccionController
 * Servicios: AuthService, UsuarioService, DireccionService, GoogleTokenService
 */
public class UsuarioModule {
    public static final String DOMAIN = "USUARIO_AUTENTICACION";
}
