package com.mercatto.modules.soporte.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private static final long START_TIME_MS = System.currentTimeMillis();

    @GetMapping({"/api/health", "/api/ping"})
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "UP");
        resp.put("service", "mercatto-backend");
        resp.put("timestamp", Instant.now().toString());
        resp.put("uptimeSeconds", (System.currentTimeMillis() - START_TIME_MS) / 1000);
        
        Runtime runtime = Runtime.getRuntime();
        long freeMb = runtime.freeMemory() / (1024 * 1024);
        long totalMb = runtime.totalMemory() / (1024 * 1024);
        resp.put("memory", freeMb + "MB libre de " + totalMb + "MB");

        return ResponseEntity.ok(resp);
    }
}
