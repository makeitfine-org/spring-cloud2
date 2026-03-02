package reacty.probe.one.inventory.order;

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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import reacty.probe.one.inventory.order.model.Order;
import reacty.probe.one.inventory.order.repository.OrderRepository;

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
class OrderServiceIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Container
    @ServiceConnection
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0"));

    @DynamicPropertySource
    static void kafkaProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Autowired
    WebTestClient webTestClient;

    @Autowired
    OrderRepository orderRepository;

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

        orderRepository.deleteAll().block();
    }

    @AfterEach
    void tearDown() {
        kafkaConsumer.close();
        kafkaProducer.close();
    }

    @Test
    void createOrder_returnsPendingOrder() {
        Order order = new Order("prod-1", 5, new BigDecimal("29.99"));

        webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(order)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .value(saved -> {
                    assertThat(saved.getId()).isNotNull();
                    assertThat(saved.getStatus()).isEqualTo("PENDING");
                    assertThat(saved.getProductId()).isEqualTo("prod-1");
                    assertThat(saved.getQuantity()).isEqualTo(5);
                });
    }

    @Test
    void createOrder_publishesOrderCreatedEvent() throws Exception {
        kafkaConsumer.subscribe(List.of("order-created"));

        Order order = new Order("prod-1", 3, new BigDecimal("10.00"));
        Order saved = webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(order)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .returnResult().getResponseBody();

        assertThat(saved).isNotNull();

        boolean[] eventFound = {false};
        await().atMost(Duration.ofSeconds(10)).untilAsserted(() -> {
            var records = kafkaConsumer.poll(Duration.ofMillis(500));
            for (ConsumerRecord<String, String> record : records) {
                Map<?, ?> payload = objectMapper.readValue(record.value(), Map.class);
                if (saved.getId().equals(((Number) payload.get("orderId")).longValue())) {
                    eventFound[0] = true;
                }
            }
            assertThat(eventFound[0]).isTrue();
        });
    }

    @Test
    void getOrder_existingId_returnsOrder() {
        Order created = webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-2", 2, new BigDecimal("5.00")))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .returnResult().getResponseBody();

        assertThat(created).isNotNull();

        webTestClient.get()
                .uri("/api/orders/{id}", created.getId())
                .exchange()
                .expectStatus().isOk()
                .expectBody(Order.class)
                .value(o -> assertThat(o.getId()).isEqualTo(created.getId()));
    }

    @Test
    void getOrder_nonExistingId_returns404() {
        webTestClient.get()
                .uri("/api/orders/9999")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void getAllOrders_returnsAll() {
        webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-1", 1, new BigDecimal("1.00")))
                .exchange()
                .expectStatus().isCreated();

        webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-2", 2, new BigDecimal("2.00")))
                .exchange()
                .expectStatus().isCreated();

        webTestClient.get()
                .uri("/api/orders")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Order.class)
                .hasSize(2);
    }

    @Test
    void handleInventoryReserved_updatesStatusToInventoryReserved() throws Exception {
        Order created = webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-1", 5, new BigDecimal("9.99")))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .returnResult().getResponseBody();

        assertThat(created).isNotNull();

        String event = objectMapper.writeValueAsString(
                Map.of("orderId", created.getId(), "productId", "prod-1", "quantity", 5));
        kafkaProducer.send(new ProducerRecord<>("inventory-reserved",
                String.valueOf(created.getId()), event)).get();

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Order updated = orderRepository.findById(created.getId()).block();
            assertThat(updated).isNotNull();
            assertThat(updated.getStatus()).isEqualTo("INVENTORY_RESERVED");
        });
    }

    @Test
    void handleInventoryFailed_updatesStatusToCancelled() throws Exception {
        Order created = webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-2", 100, new BigDecimal("1.00")))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .returnResult().getResponseBody();

        assertThat(created).isNotNull();

        String event = objectMapper.writeValueAsString(
                Map.of("orderId", created.getId(), "productId", "prod-2",
                        "reason", "Insufficient stock"));
        kafkaProducer.send(new ProducerRecord<>("inventory-failed",
                String.valueOf(created.getId()), event)).get();

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Order updated = orderRepository.findById(created.getId()).block();
            assertThat(updated).isNotNull();
            assertThat(updated.getStatus()).isEqualTo("CANCELLED");
        });
    }

    @Test
    void handleDeliveryScheduled_updatesStatusToConfirmed() throws Exception {
        Order created = webTestClient.post()
                .uri("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(new Order("prod-3", 1, new BigDecimal("15.00")))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(Order.class)
                .returnResult().getResponseBody();

        assertThat(created).isNotNull();

        String event = objectMapper.writeValueAsString(
                Map.of("orderId", created.getId(), "deliveryId", 42, "status", "SCHEDULED"));
        kafkaProducer.send(new ProducerRecord<>("delivery-scheduled",
                String.valueOf(created.getId()), event)).get();

        await().atMost(Duration.ofSeconds(15)).untilAsserted(() -> {
            Order updated = orderRepository.findById(created.getId()).block();
            assertThat(updated).isNotNull();
            assertThat(updated.getStatus()).isEqualTo("CONFIRMED");
        });
    }
}
