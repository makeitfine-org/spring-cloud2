package reacty.probe.one.inventory.order.event;

public record DeliveryScheduledEvent(
        Long orderId,
        Long deliveryId,
        String status
) {
}
