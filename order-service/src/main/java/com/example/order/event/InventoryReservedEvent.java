package com.example.order.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {}
