package com.example.inventory.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class SagaEventProducer {

    private static final Logger log = LoggerFactory.getLogger(SagaEventProducer.class);
    private static final String INVENTORY_RESERVED_TOPIC = "inventory-reserved";
    private static final String INVENTORY_FAILED_TOPIC = "inventory-failed";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public SagaEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishInventoryReserved(InventoryReservedEvent event) {
        log.info("Publishing InventoryReservedEvent for order {}", event.orderId());
        kafkaTemplate.send(INVENTORY_RESERVED_TOPIC, String.valueOf(event.orderId()), event);
    }

    public void publishInventoryFailed(InventoryFailedEvent event) {
        log.info("Publishing InventoryFailedEvent for order {}", event.orderId());
        kafkaTemplate.send(INVENTORY_FAILED_TOPIC, String.valueOf(event.orderId()), event);
    }
}
