package reacty.probe.one.inventory.order.event;

public record InventoryFailedEvent(
        Long orderId,
        String productId,
        String reason
) {}
