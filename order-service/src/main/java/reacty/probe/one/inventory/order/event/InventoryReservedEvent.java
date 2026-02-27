package reacty.probe.one.inventory.order.event;

public record InventoryReservedEvent(
        Long orderId,
        String productId,
        Integer quantity
) {
}
