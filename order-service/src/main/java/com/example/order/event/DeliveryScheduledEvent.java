package com.example.order.event;

public record DeliveryScheduledEvent(
        Long orderId,
        Long deliveryId,
        String status
) {}
