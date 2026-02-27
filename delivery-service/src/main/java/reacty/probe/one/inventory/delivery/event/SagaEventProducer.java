package reacty.probe.one.inventory.delivery.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SagaEventProducer {
    private static final String DELIVERY_SCHEDULED_TOPIC = "delivery-scheduled";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SagaEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishDeliveryScheduled(DeliveryScheduledEvent event) {
        log.info("Publishing DeliveryScheduledEvent for order {} — delivery {}", event.orderId(), event.deliveryId());
        kafkaTemplate.send(DELIVERY_SCHEDULED_TOPIC, String.valueOf(event.orderId()), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish DeliveryScheduledEvent for order {}: {}",
                                event.orderId(), ex.getMessage());
                    }
                });
    }
}
