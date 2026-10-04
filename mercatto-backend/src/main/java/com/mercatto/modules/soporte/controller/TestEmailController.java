package com.mercatto.modules.soporte.controller;

import com.mercatto.modules.soporte.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/api/test/email")
    public Map<String, String> enviarPrueba(@RequestParam String to) {
        emailService.enviarNotificacion(
                to,
                "Correo de prueba — Mercatto",
                "Si estás leyendo esto, el envío de correo de Mercatto está funcionando correctamente."
        );
        return Map.of(
                "mensaje", "Se intentó enviar el correo a " + to + ". Revisa tu bandeja (y spam) en unos segundos."
        );
    }
}