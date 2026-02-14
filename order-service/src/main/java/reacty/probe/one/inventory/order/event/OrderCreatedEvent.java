package reacty.probe.one.inventory.order.event;

import java.math.BigDecimal;

public record OrderCreatedEvent(
        Long orderId,
        String productId,
        Integer quantity,
        BigDecimal price
) {}
