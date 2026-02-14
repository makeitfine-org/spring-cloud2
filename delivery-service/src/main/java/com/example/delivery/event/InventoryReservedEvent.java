package com.example.delivery.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {}
