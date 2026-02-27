package reacty.probe.one.inventory.order.service;

import reacty.probe.one.inventory.order.event.OrderCreatedEvent;
import reacty.probe.one.inventory.order.model.Order;
import reacty.probe.one.inventory.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class OrderService {
    private static final String ORDER_CREATED_TOPIC = "order-created";

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public OrderService(OrderRepository orderRepository,
                        KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @CircuitBreaker(name = "orderService", fallbackMethod = "createOrderFallback")
    public Mono<Order> createOrder(Order order) {
        order.setStatus("PENDING");
        return orderRepository.save(order)
                .doOnSuccess(savedOrder -> {
                    log.info("Order created with ID: {} — publishing OrderCreatedEvent", savedOrder.getId());
                    OrderCreatedEvent event = new OrderCreatedEvent(
                            savedOrder.getId(),
                            savedOrder.getProductId(),
                            savedOrder.getQuantity(),
                            savedOrder.getPrice()
                    );
                    kafkaTemplate.send(ORDER_CREATED_TOPIC, String.valueOf(savedOrder.getId()), event)
                            .whenComplete((result, ex) -> {
                                if (ex != null) {
                                    log.error("Failed to publish OrderCreatedEvent for order {}: {}",
                                            savedOrder.getId(), ex.getMessage());
                                }
                            });
                });
    }

    public Mono<Order> createOrderFallback(Order order, Throwable t) {
        log.error("Circuit breaker triggered for createOrder: {}", t.getMessage());
        order.setStatus("FAILED");
        order.setFailureReason("Service temporarily unavailable: " + t.getMessage());
        return Mono.just(order);
    }

    public Mono<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Flux<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Mono<Order> updateOrderStatus(Long orderId, String status, String reason) {
        log.debug("Looking up order {} to update status to {}", orderId, status);
        return orderRepository.findById(orderId)
                .switchIfEmpty(Mono.fromRunnable(() ->
                    log.error("Order {} not found when trying to update status to {}", orderId, status)
                ).then(Mono.empty()))
                .flatMap(order -> {
                    order.setStatus(status);
                    if (reason != null) {
                        order.setFailureReason(reason);
                    }
                    order.setUpdatedAt(java.time.LocalDateTime.now());
                    return orderRepository.save(order);
                })
                .doOnSuccess(order -> log.info("Order {} status updated to {}", orderId, status));
    }
}
