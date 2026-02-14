package reacty.probe.one.inventory.delivery.event;

import reacty.probe.one.inventory.delivery.service.DeliveryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SagaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SagaEventConsumer.class);

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
        log.info("Received InventoryReservedEvent — orderId: {}, productId: {}, qty: {}",
                event.orderId(), event.productId(), event.quantity());

        deliveryService.scheduleDelivery(event.orderId(), event.productId(), event.quantity())
                .subscribe(delivery -> {
                    log.info("Delivery scheduled for order {} — delivery ID: {} — publishing DeliveryScheduledEvent",
                            event.orderId(), delivery.getId());
                    sagaEventProducer.publishDeliveryScheduled(
                            new DeliveryScheduledEvent(event.orderId(), delivery.getId(), delivery.getStatus()));
                });
    }
}
