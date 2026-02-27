package reacty.probe.one.inventory.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reacty.probe.one.inventory.delivery.model.Delivery;
import reacty.probe.one.inventory.delivery.repository.DeliveryRepository;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureWebTestClient
class DeliveryServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    @Autowired
    WebTestClient webTestClient;

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    ObjectMapper objectMapper;

    private KafkaConsumer<String, String> kafkaConsumer;
    private KafkaProducer<String, String> kafkaProducer;

    @BeforeEach
    void setUp() {
        Properties consumerProps = new Properties();
        consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "test-consumer-group-" + System.nanoTime());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        kafkaConsumer = new KafkaConsumer<>(consumerProps);

        Properties producerProps = new Properties();
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafka.getBootstrapServers());
        producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        kafkaProducer = new KafkaProducer<>(producerProps);

        deliveryRepository.deleteAll().block();
    }

    @AfterEach
    void tearDown() {
        kafkaConsumer.close();
        kafkaProducer.close();
    }

    @Test
    void getAllDeliveries_returnsEmpty() {
        webTestClient.get()
                .uri("/api/deliveries")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Delivery.class)
                .hasSize(0);
    }

    @Test
    void getDelivery_nonExistingId_returns404() {
        webTestClient.get()
                .uri("/api/deliveries/9999")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void getDeliveryByOrder_nonExistingOrderId_returns404() {
        webTestClient.get()
                .uri("/api/deliveries/order/9999")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void handleInventoryReserved_schedulesDelivery() throws Exception {
        kafkaConsumer.subscribe(List.of("delivery-scheduled"));

        long orderId = 200L;
        String event = objectMapper.writeValueAsString(
                Map.of("orderId", orderId, "productId", "prod-1", "quantity", 3));
        kafkaProducer.send(new ProducerRecord<>("inventory-reserved",
                String.valueOf(orderId), event)).get();

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Delivery delivery = deliveryRepository.findByOrderId(orderId).block();
            assertThat(delivery).isNotNull();
            assertThat(delivery.getStatus()).isEqualTo("SCHEDULED");
            assertThat(delivery.getOrderId()).isEqualTo(orderId);
        });

        boolean[] eventFound = {false};
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            var records = kafkaConsumer.poll(Duration.ofMillis(500));
            for (ConsumerRecord<String, String> record : records) {
                Map<?, ?> payload = objectMapper.readValue(record.value(), Map.class);
                if (((Number) payload.get("orderId")).longValue() == orderId) {
                    eventFound[0] = true;
                }
            }
            assertThat(eventFound[0]).isTrue();
        });
    }

    @Test
    void getDelivery_afterScheduling_returnsDelivery() throws Exception {
        long orderId = 201L;
        String event = objectMapper.writeValueAsString(
                Map.of("orderId", orderId, "productId", "prod-2", "quantity", 1));
        kafkaProducer.send(new ProducerRecord<>("inventory-reserved",
                String.valueOf(orderId), event)).get();

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Delivery delivery = deliveryRepository.findByOrderId(orderId).block();
            assertThat(delivery).isNotNull();
        });

        Delivery delivery = deliveryRepository.findByOrderId(orderId).block();
        assertThat(delivery).isNotNull();

        webTestClient.get()
                .uri("/api/deliveries/{id}", delivery.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Delivery.class)
                .value(d -> {
                    assertThat(d.getId()).isEqualTo(delivery.getId());
                    assertThat(d.getOrderId()).isEqualTo(orderId);
                    assertThat(d.getStatus()).isEqualTo("SCHEDULED");
                });
    }
}
