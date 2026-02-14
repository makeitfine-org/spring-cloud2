package com.example.inventory.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {}
