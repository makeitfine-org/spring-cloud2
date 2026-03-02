package reacty.probe.one.inventory.delivery;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.r2dbc.spi.ConnectionFactory;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.r2dbc.connection.init.ConnectionFactoryInitializer;
import org.springframework.r2dbc.connection.init.ResourceDatabasePopulator;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import reacty.probe.one.inventory.delivery.model.Delivery;
import reacty.probe.one.inventory.delivery.repository.DeliveryRepository;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("fast")
@AutoConfigureWebTestClient
@EmbeddedKafka(
        partitions = 1,
        bootstrapServersProperty = "spring.kafka.bootstrap-servers",
        topics = {"order-created", "inventory-reserved", "inventory-failed", "delivery-scheduled"}
)
class DeliveryServiceFastTest {

    @TestConfiguration
    static class H2SchemaConfig {
        @Bean("initializer")
        ConnectionFactoryInitializer initializer(ConnectionFactory connectionFactory) {
            ConnectionFactoryInitializer init = new ConnectionFactoryInitializer();
            init.setConnectionFactory(connectionFactory);
            init.setDatabasePopulator(
                    new ResourceDatabasePopulator(new ClassPathResource("schema-h2.sql")));
            return init;
        }
    }

    @Autowired
    WebTestClient webTestClient;

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    EmbeddedKafkaBroker embeddedKafkaBroker;

    private KafkaConsumer<String, String> kafkaConsumer;
    private KafkaProducer<String, String> kafkaProducer;

    @BeforeEach
    void setUp() {
        deliveryRepository.deleteAll().block();

        Map<String, Object> consumerProps = KafkaTestUtils.consumerProps(
                "test-group-" + System.nanoTime(), "true", embeddedKafkaBroker);
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        kafkaConsumer = new KafkaConsumer<>(consumerProps, new StringDeserializer(), new StringDeserializer());

        Map<String, Object> producerProps = KafkaTestUtils.producerProps(embeddedKafkaBroker);
        kafkaProducer = new KafkaProducer<>(producerProps, new StringSerializer(), new StringSerializer());
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

        await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
            Delivery delivery = deliveryRepository.findByOrderId(orderId).block();
            assertThat(delivery).isNotNull();
            assertThat(delivery.getStatus()).isEqualTo("SCHEDULED");
            assertThat(delivery.getOrderId()).isEqualTo(orderId);
        });

        boolean[] eventFound = {false};
        await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
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

        await().atMost(Duration.ofSeconds(3)).untilAsserted(() -> {
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
