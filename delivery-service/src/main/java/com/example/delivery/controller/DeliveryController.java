package com.example.delivery.controller;

import com.example.delivery.model.Delivery;
import com.example.delivery.service.DeliveryService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/{id}")
    public Mono<Delivery> getById(@PathVariable Long id) {
        return deliveryService.getById(id);
    }

    @GetMapping("/order/{orderId}")
    public Mono<Delivery> getByOrderId(@PathVariable Long orderId) {
        return deliveryService.getByOrderId(orderId);
    }

    @GetMapping
    public Flux<Delivery> getAll() {
        return deliveryService.getAllDeliveries();
    }
}
