package com.luv2code.ecommerce.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.luv2code.ecommerce.dto.PaymentInfo;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PaymentService {

    @Value("${stripe.api-key}")
    private String secretKey;

    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws Exception {
        Stripe.apiKey = secretKey;
        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object> params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency",paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);

        return PaymentIntent.create(params);
    }


}
