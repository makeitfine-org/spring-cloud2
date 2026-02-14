package com.example.order.event;

public record InventoryFailedEvent(
        Long orderId,
        String productId,
        String reason
) {}
