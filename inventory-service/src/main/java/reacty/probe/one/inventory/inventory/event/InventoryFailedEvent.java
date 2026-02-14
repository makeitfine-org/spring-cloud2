package reacty.probe.one.inventory.inventory.event;

public record InventoryFailedEvent(
        Long orderId,
        String productId,
        String reason
) {}
