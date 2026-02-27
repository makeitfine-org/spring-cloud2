package reacty.probe.one.inventory.inventory;

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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reacty.probe.one.inventory.inventory.model.InventoryItem;
import reacty.probe.one.inventory.inventory.repository.InventoryRepository;

import java.math.BigDecimal;
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
class InventoryServiceIntegrationTest {

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
    InventoryRepository inventoryRepository;

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
    }

    @AfterEach
    void tearDown() {
        kafkaConsumer.close();
        kafkaProducer.close();
    }

    @Test
    void getInventoryItem_existingProduct_returnsItem() {
        webTestClient.get()
                .uri("/api/inventory/prod-1")
                .exchange()
                .expectStatus().isOk()
                .expectBody(InventoryItem.class)
                .value(item -> {
                    assertThat(item.getProductId()).isEqualTo("prod-1");
                    assertThat(item.getQuantity()).isEqualTo(100);
                });
    }

    @Test
    void getInventoryItem_nonExistingProduct_returns404() {
        webTestClient.get()
                .uri("/api/inventory/unknown-product")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void addInventoryItem_createsItem() {
        InventoryItem item = new InventoryItem("prod-test-new", 50);

        webTestClient.post()
                .uri("/api/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(item)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(InventoryItem.class)
                .value(saved -> {
                    assertThat(saved.getId()).isNotNull();
                    assertThat(saved.getProductId()).isEqualTo("prod-test-new");
                    assertThat(saved.getQuantity()).isEqualTo(50);
                });
    }

    @Test
    void getAllItems_returnsSeededItems() {
        webTestClient.get()
                .uri("/api/inventory")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(InventoryItem.class)
                .value(items -> {
                    List<String> productIds = items.stream()
                            .map(InventoryItem::getProductId)
                            .toList();
                    assertThat(productIds).contains("prod-1", "prod-2", "prod-3");
                });
    }

    @Test
    void handleOrderCreated_sufficientStock_publishesInventoryReserved() throws Exception {
        kafkaConsumer.subscribe(List.of("inventory-reserved"));

        String event = objectMapper.writeValueAsString(
                Map.of("orderId", 100L, "productId", "prod-1", "quantity", 5,
                        "price", new BigDecimal("9.99")));
        kafkaProducer.send(new ProducerRecord<>("order-created", "100", event)).get();

        boolean[] eventFound = {false};
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            var records = kafkaConsumer.poll(Duration.ofMillis(500));
            for (ConsumerRecord<String, String> record : records) {
                Map<?, ?> payload = objectMapper.readValue(record.value(), Map.class);
                if ("prod-1".equals(payload.get("productId"))) {
                    eventFound[0] = true;
                }
            }
            assertThat(eventFound[0]).isTrue();
        });

        InventoryItem item = inventoryRepository.findByProductId("prod-1").block();
        assertThat(item).isNotNull();
        assertThat(item.getReservedQuantity()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void handleOrderCreated_insufficientStock_publishesInventoryFailed() throws Exception {
        kafkaConsumer.subscribe(List.of("inventory-failed"));

        String event = objectMapper.writeValueAsString(
                Map.of("orderId", 101L, "productId", "prod-2", "quantity", 100,
                        "price", new BigDecimal("1.00")));
        kafkaProducer.send(new ProducerRecord<>("order-created", "101", event)).get();

        boolean[] eventFound = {false};
        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            var records = kafkaConsumer.poll(Duration.ofMillis(500));
            for (ConsumerRecord<String, String> record : records) {
                Map<?, ?> payload = objectMapper.readValue(record.value(), Map.class);
                if ("prod-2".equals(payload.get("productId"))) {
                    eventFound[0] = true;
                }
            }
            assertThat(eventFound[0]).isTrue();
        });
    }
}
