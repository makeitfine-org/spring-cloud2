package com.example.inventory.repository;

import com.example.inventory.model.InventoryItem;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface InventoryRepository extends ReactiveCrudRepository<InventoryItem, Long> {

    Mono<InventoryItem> findByProductId(String productId);
}
