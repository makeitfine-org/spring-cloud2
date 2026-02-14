package com.example.order.repository;

import com.example.order.model.Order;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface OrderRepository extends ReactiveCrudRepository<Order, Long> {

    Flux<Order> findByProductId(String productId);

    Flux<Order> findByStatus(String status);
}
