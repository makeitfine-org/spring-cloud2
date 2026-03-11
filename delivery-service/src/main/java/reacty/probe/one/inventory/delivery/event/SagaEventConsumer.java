package reacty.probe.one.inventory.delivery.event;

import reacty.probe.one.inventory.delivery.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SagaEventConsumer {

    private final DeliveryService deliveryService;
    private final SagaEventProducer sagaEventProducer;

    public SagaEventConsumer(DeliveryService deliveryService, SagaEventProducer sagaEventProducer) {
        this.deliveryService = deliveryService;
        this.sagaEventProducer = sagaEventProducer;
    }

    @KafkaListener(
            topics = "inventory-reserved",
            groupId = "delivery-service-group",
            containerFactory = "inventoryReservedListenerFactory"
    )
    public void handleInventoryReserved(InventoryReservedEvent event) {
        try {
            log.info("Received InventoryReservedEvent — orderId: {}, productId: {}, qty: {}",
                    event.orderId(), event.productId(), event.quantity());
            deliveryService.scheduleDelivery(event.orderId(), event.productId(), event.quantity())
                    .subscribe(
                            delivery -> {
                                log.info("Delivery scheduled for order {} — delivery ID: {} — publishing DeliveryScheduledEvent",
                                        event.orderId(), delivery.getId());
                                sagaEventProducer.publishDeliveryScheduled(
                                        new DeliveryScheduledEvent(event.orderId(), delivery.getId(), delivery.getStatus()));
                            },
                            error -> log.error("Failed to schedule delivery for order {}: {}",
                                    event.orderId(), error.getMessage(), error)
                    );
        } catch (Exception e) {
            log.error("Unexpected error handling InventoryReservedEvent for order {}: {}",
                    event.orderId(), e.getMessage(), e);
        }
    }
}
