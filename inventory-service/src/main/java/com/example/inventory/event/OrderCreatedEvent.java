package com.example.inventory.event;

import java.math.BigDecimal;

public record OrderCreatedEvent(
        Long orderId,
        String productId,
        Integer quantity,
        BigDecimal price
) {}
