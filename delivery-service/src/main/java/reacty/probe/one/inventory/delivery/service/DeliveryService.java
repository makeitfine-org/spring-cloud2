package reacty.probe.one.inventory.delivery.service;

import reacty.probe.one.inventory.delivery.model.Delivery;
import reacty.probe.one.inventory.delivery.repository.DeliveryRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;

    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @CircuitBreaker(name = "deliveryService", fallbackMethod = "scheduleDeliveryFallback")
    public Mono<Delivery> scheduleDelivery(Long orderId, String productId, Integer quantity) {
        Delivery delivery = new Delivery(orderId, productId, quantity);
        return deliveryRepository.save(delivery)
                .doOnSuccess(saved -> log.info("Delivery scheduled — id: {}, orderId: {}", saved.getId(), orderId));
    }

    public Mono<Delivery> scheduleDeliveryFallback(Long orderId, String productId, Integer quantity, Throwable t) {
        log.error("Circuit breaker triggered for scheduleDelivery: {}", t.getMessage());
        Delivery failedDelivery = new Delivery(orderId, productId, quantity);
        failedDelivery.setStatus("FAILED");
        return Mono.just(failedDelivery);
    }

    public Mono<Delivery> getByOrderId(Long orderId) {
        return deliveryRepository.findByOrderId(orderId);
    }

    public Flux<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    public Mono<Delivery> getById(Long id) {
        return deliveryRepository.findById(id);
    }
}
