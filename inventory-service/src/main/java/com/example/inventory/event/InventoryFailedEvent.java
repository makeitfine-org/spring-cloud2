package com.example.inventory.event;

public record InventoryFailedEvent(
        Long orderId,
        String productId,
        String reason
) {}
