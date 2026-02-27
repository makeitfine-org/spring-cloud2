package reacty.probe.one.inventory.inventory.event;

import reacty.probe.one.inventory.inventory.service.InventoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SagaEventConsumer {

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
