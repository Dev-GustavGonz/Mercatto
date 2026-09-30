package com.mercatto.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;

@Service
public class WompiService {

    private static final Logger log = LoggerFactory.getLogger(WompiService.class);

    @Value("${wompi.public-key:pub_test_Q5yDA9xoKdePzhSGeVe9KvxXQKIO5Ade}")
    private String publicKey;

    @Value("${wompi.private-key:prv_test_V0P7fI9L8YnO6R4W2M1K3J5H7G9F1D3S}")
    private String privateKey;

    @Value("${wompi.integrity-secret:test_integrity_456789abcdefghijklmnopqrstuv}")
    private String integritySecret;

    @Value("${wompi.currency:COP}")
    private String currency;

    /**
     * Genera la firma de integridad obligatoria de Wompi:
     * SHA256(reference + amountInCents + currency + integritySecret)
     */
    public String generarFirmaIntegridad(String referencia, long montoEnCentavos, String moneda) {
        try {
            String cadena = referencia + montoEnCentavos + moneda + integritySecret;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(cadena.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            log.error("Error generando firma de integridad Wompi: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Prepara los parámetros para el Checkout Widget de Wompi
     */
    public Map<String, Object> prepararCheckout(Double monto, String codigoPedido, String emailCliente, String nombreCliente, String telefonoCliente) {
        long montoEnCentavos = Math.round(monto * 100);
        String referencia = "MERCATTO-" + codigoPedido + "-" + System.currentTimeMillis();
        String firma = generarFirmaIntegridad(referencia, montoEnCentavos, currency);

        Map<String, Object> data = new HashMap<>();
        data.put("publicKey", publicKey);
        data.put("currency", currency);
        data.put("amountInCents", montoEnCentavos);
        data.put("reference", referencia);
        data.put("signatureIntegrity", firma);
        data.put("customerEmail", emailCliente);
        data.put("customerFullName", nombreCliente);
        data.put("customerPhoneNumber", telefonoCliente);
        data.put("redirectUrl", "http://localhost:5173/pago/exitoso?ref=" + referencia);

        return data;
    }

    /**
     * Valida la firma del evento Webhook recibido de Wompi
     */
    public boolean validarFirmaWebhook(String transaccionId, String status, long amountInCents, String timestamp, String checksumRecibido) {
        try {
            // Wompi calcula firma en webhook según su estándar: SHA256(id + status + amount_in_cents + timestamp + event_secret)
            String cadena = transaccionId + status + amountInCents + timestamp + integritySecret;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(cadena.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(checksumRecibido);
        } catch (Exception e) {
            log.error("Error verificando checksum webhook Wompi: {}", e.getMessage());
            return false;
        }
    }

    public String getPublicKey() {
        return publicKey;
    }
}
