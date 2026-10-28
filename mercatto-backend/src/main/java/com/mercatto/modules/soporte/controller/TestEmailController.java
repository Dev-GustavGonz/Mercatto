package com.mercatto.modules.soporte.controller;

import com.mercatto.modules.soporte.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/api/test/email")
    public ResponseEntity<Map<String, Object>> enviarPrueba(
            @RequestParam(required = false, defaultValue = "realmercatto@gmail.com") String to) {
        Map<String, Object> resultado = emailService.probarEnvio(to);
        return ResponseEntity.ok(resultado);
    }
}
