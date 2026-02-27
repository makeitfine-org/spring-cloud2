package reacty.probe.one.inventory.delivery.event;

public record DeliveryScheduledEvent(
        Long orderId,
        Long deliveryId,
        String status
) {
}
