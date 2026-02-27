package reacty.probe.one.inventory.inventory.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {
}
