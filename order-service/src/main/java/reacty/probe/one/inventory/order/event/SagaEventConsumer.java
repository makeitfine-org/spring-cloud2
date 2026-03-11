package reacty.probe.one.inventory.order.event;

import reacty.probe.one.inventory.order.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SagaEventConsumer {

    private static final int BLOCK_TIMEOUT_SECONDS = 10;

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
        // Inventory reserved — waiting for delivery scheduling
        try {
            log.info("Received InventoryReservedEvent for order: {}", event.orderId());
            orderService.updateOrderStatus(event.orderId(), "INVENTORY_RESERVED", null)
                    .block(java.time.Duration.ofSeconds(BLOCK_TIMEOUT_SECONDS));
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
        try {
            log.info("Received InventoryFailedEvent for order: {} — reason: {}", event.orderId(), event.reason());
            orderService.updateOrderStatus(event.orderId(), "CANCELLED", event.reason())
                    .block(java.time.Duration.ofSeconds(BLOCK_TIMEOUT_SECONDS));
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
        try {
            log.info("Received DeliveryScheduledEvent for order: {} — delivery ID: {}",
                    event.orderId(), event.deliveryId());
            orderService.updateOrderStatus(event.orderId(), "CONFIRMED", null)
                    .block(java.time.Duration.ofSeconds(BLOCK_TIMEOUT_SECONDS));
            log.info("Order {} status successfully updated to CONFIRMED", event.orderId());
        } catch (Exception e) {
            log.error("Failed to update order {} status to CONFIRMED: {}",
                    event.orderId(), e.getMessage(), e);
        }
    }
}
