package com.example.gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/orders")
    public Mono<Map<String, String>> ordersFallback() {
        return Mono.just(Map.of(
                "status", "SERVICE_UNAVAILABLE",
                "message", "Order service is currently unavailable. Please try again later."
        ));
    }

    @GetMapping("/inventory")
    public Mono<Map<String, String>> inventoryFallback() {
        return Mono.just(Map.of(
                "status", "SERVICE_UNAVAILABLE",
                "message", "Inventory service is currently unavailable. Please try again later."
        ));
    }

    @GetMapping("/deliveries")
    public Mono<Map<String, String>> deliveriesFallback() {
        return Mono.just(Map.of(
                "status", "SERVICE_UNAVAILABLE",
                "message", "Delivery service is currently unavailable. Please try again later."
        ));
    }
}
