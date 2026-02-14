package com.example.inventory.event;

import com.example.inventory.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SagaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SagaEventConsumer.class);

    private final InventoryService inventoryService;
    private final SagaEventProducer sagaEventProducer;

    public SagaEventConsumer(InventoryService inventoryService, SagaEventProducer sagaEventProducer) {
        this.inventoryService = inventoryService;
        this.sagaEventProducer = sagaEventProducer;
    }

    @KafkaListener(
            topics = "order-created",
            groupId = "inventory-service-group",
            containerFactory = "orderCreatedListenerFactory"
    )
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent — orderId: {}, productId: {}, qty: {}",
                event.orderId(), event.productId(), event.quantity());

        inventoryService.reserveStock(event.productId(), event.quantity())
                .subscribe(reserved -> {
                    if (reserved) {
                        log.info("Stock reserved for order {} — publishing InventoryReservedEvent", event.orderId());
                        sagaEventProducer.publishInventoryReserved(
                                new InventoryReservedEvent(event.orderId(), event.productId(), event.quantity()));
                    } else {
                        log.warn("Stock reservation failed for order {} — publishing InventoryFailedEvent", event.orderId());
                        sagaEventProducer.publishInventoryFailed(
                                new InventoryFailedEvent(event.orderId(), event.productId(),
                                        "Insufficient stock for product: " + event.productId()));
                    }
                });
    }
}
