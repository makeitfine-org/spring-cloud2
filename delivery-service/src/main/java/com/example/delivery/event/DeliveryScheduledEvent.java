package com.example.delivery.event;

public record DeliveryScheduledEvent(
        Long orderId,
        Long deliveryId,
        String status
) {}
