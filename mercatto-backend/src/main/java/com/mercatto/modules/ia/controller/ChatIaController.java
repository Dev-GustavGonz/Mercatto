package com.mercatto.modules.ia.controller;

import com.mercatto.modules.ia.dto.ChatIaRequest;
import com.mercatto.modules.ia.dto.ChatIaResponse;
import com.mercatto.modules.ia.service.MultiAgenteIaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ia")
public class ChatIaController {

    @Autowired
    private MultiAgenteIaService multiAgenteService;

    // POST /api/ia/chat (Público: Asistente virtual con failover automático de agentes por agotamiento de tokens)
    @PostMapping("/chat")
    public ResponseEntity<ChatIaResponse> chatearConAgentes(@RequestBody ChatIaRequest request) {
        ChatIaResponse respuesta = multiAgenteService.procesarMensaje(
                request.getMessage(),
                request.getSessionId()
        );
        return ResponseEntity.ok(respuesta);
    }

    // GET /api/ia/estado-agentes (Público: Monitor en tiempo real para la presentación en la feria)
    @GetMapping("/estado-agentes")
    public ResponseEntity<Map<String, Object>> verEstadoAgentes() {
        return ResponseEntity.ok(multiAgenteService.obtenerEstadoAgentes());
    }

    // POST /api/ia/simular-failover (Para probar en la feria cómo conmuta de un agente a otro)
    @PostMapping("/test-fallback")
    public ResponseEntity<Map<String, Object>> probarFallback(@RequestParam(defaultValue = "Hola, ¿cómo compro en Mercatto?") String mensaje) {
        String respuestaLocal = multiAgenteService.responderConAgenteLocal(mensaje);
        return ResponseEntity.ok(Map.of(
                "prueba", "Agente de Respaldo Local Infalible",
                "respuesta", respuestaLocal,
                "garantia", "100% de disponibilidad sin consumo de tokens externos"
        ));
    }
}
