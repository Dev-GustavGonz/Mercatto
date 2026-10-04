package com.mercatto.modules.pedido.service;

import com.mercatto.modules.pedido.model.Pedido;

import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class StripeService {

    @Value("${stripe.secret-key:sk_test_TU_CLAVE_AQUI}")
    private String secretKey;

    @Value("${stripe.currency:cop}")
    private String currency;

    public Map<String, Object> crearPaymentIntent(Double monto, String codigoPedido, String emailCliente) {
        Map<String, Object> res = new HashMap<>();

        // Si la clave no está configurada, devolvemos un client secret simulado para testing local
        if (secretKey == null || secretKey.startsWith("sk_test_TU_CLAVE")) {
            res.put("clientSecret", "pi_mock_" + UUID.randomUUID() + "_secret_" + UUID.randomUUID());
            res.put("paymentIntentId", "pi_mock_" + UUID.randomUUID());
            res.put("simulado", true);
            return res;
        }

        try {
            long montoEnCentavos = Math.round(monto * 100);
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(montoEnCentavos)
                    .setCurrency(currency)
                    .setDescription("Mercatto Pedido: " + codigoPedido)
                    .putMetadata("codigoPedido", codigoPedido)
                    .putMetadata("emailCliente", emailCliente)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            res.put("clientSecret", intent.getClientSecret());
            res.put("paymentIntentId", intent.getId());
            res.put("simulado", false);
            return res;
        } catch (Exception e) {
            // Fallback a simulado en caso de error de conexión Stripe
            res.put("clientSecret", "pi_mock_" + UUID.randomUUID() + "_secret_" + UUID.randomUUID());
            res.put("paymentIntentId", "pi_mock_" + UUID.randomUUID());
            res.put("simulado", true);
            res.put("error", e.getMessage());
            return res;
        }
    }
}
