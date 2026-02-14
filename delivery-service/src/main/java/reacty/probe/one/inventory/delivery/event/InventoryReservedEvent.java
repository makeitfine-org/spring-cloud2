package reacty.probe.one.inventory.delivery.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {}
