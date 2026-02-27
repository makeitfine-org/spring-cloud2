package reacty.probe.one.inventory.order.event;

import reacty.probe.one.inventory.order.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SagaEventConsumer {

    private final OrderService orderService;

    public SagaEventConsumer(OrderService orderService) {
        this.orderService = orderService;
    }

    @KafkaListener(
            topics = "inventory-reserved",
            groupId = "order-service-group",
            containerFactory = "inventoryReservedListenerFactory"
    )
    public void handleInventoryReserved(InventoryReservedEvent event) {
        log.info("Received InventoryReservedEvent for order: {}", event.orderId());
        // Inventory reserved — waiting for delivery scheduling
        try {
            orderService.updateOrderStatus(event.orderId(), "INVENTORY_RESERVED", null)
                    .block(java.time.Duration.ofSeconds(10));
            log.info("Order {} status successfully updated to INVENTORY_RESERVED", event.orderId());
        } catch (Exception e) {
            log.error("Failed to update order {} status to INVENTORY_RESERVED: {}",
                    event.orderId(), e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "inventory-failed",
            groupId = "order-service-group",
            containerFactory = "inventoryFailedListenerFactory"
    )
    public void handleInventoryFailed(InventoryFailedEvent event) {
        log.debug("handleInventoryFailed called with event: {}", event);
        log.info("Received InventoryFailedEvent for order: {} — reason: {}", event.orderId(), event.reason());
        try {
            orderService.updateOrderStatus(event.orderId(), "CANCELLED", event.reason())
                    .block(java.time.Duration.ofSeconds(10));
            log.info("Order {} status successfully updated to CANCELLED", event.orderId());
        } catch (Exception e) {
            log.error("Failed to update order {} status to CANCELLED: {}",
                    event.orderId(), e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "delivery-scheduled",
            groupId = "order-service-group",
            containerFactory = "deliveryScheduledListenerFactory"
    )
    public void handleDeliveryScheduled(DeliveryScheduledEvent event) {
        log.info("Received DeliveryScheduledEvent for order: {} — delivery ID: {}",
                event.orderId(), event.deliveryId());
        try {
            orderService.updateOrderStatus(event.orderId(), "CONFIRMED", null)
                    .block(java.time.Duration.ofSeconds(10));
            log.info("Order {} status successfully updated to CONFIRMED", event.orderId());
        } catch (Exception e) {
            log.error("Failed to update order {} status to CONFIRMED: {}",
                    event.orderId(), e.getMessage(), e);
        }
    }
}
