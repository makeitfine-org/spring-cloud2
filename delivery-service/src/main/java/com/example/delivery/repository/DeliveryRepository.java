package com.example.delivery.repository;

import com.example.delivery.model.Delivery;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface DeliveryRepository extends ReactiveCrudRepository<Delivery, Long> {

    Mono<Delivery> findByOrderId(Long orderId);

    Flux<Delivery> findByStatus(String status);
}
