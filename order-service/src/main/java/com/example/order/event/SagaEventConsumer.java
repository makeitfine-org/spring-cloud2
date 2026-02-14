package com.example.order.event;

import com.example.order.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SagaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SagaEventConsumer.class);

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
        orderService.updateOrderStatus(event.orderId(), "INVENTORY_RESERVED", null)
                .subscribe();
    }

    @KafkaListener(
            topics = "inventory-failed",
            groupId = "order-service-group",
            containerFactory = "inventoryFailedListenerFactory"
    )
    public void handleInventoryFailed(InventoryFailedEvent event) {
        log.info("Received InventoryFailedEvent for order: {} — reason: {}", event.orderId(), event.reason());
        orderService.updateOrderStatus(event.orderId(), "CANCELLED", event.reason())
                .subscribe();
    }

    @KafkaListener(
            topics = "delivery-scheduled",
            groupId = "order-service-group",
            containerFactory = "deliveryScheduledListenerFactory"
    )
    public void handleDeliveryScheduled(DeliveryScheduledEvent event) {
        log.info("Received DeliveryScheduledEvent for order: {} — delivery ID: {}",
                event.orderId(), event.deliveryId());
        orderService.updateOrderStatus(event.orderId(), "CONFIRMED", null)
                .subscribe();
    }
}
