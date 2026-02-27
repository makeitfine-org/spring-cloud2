package reacty.probe.one.inventory.inventory.service;

import reacty.probe.one.inventory.inventory.model.InventoryItem;
import reacty.probe.one.inventory.inventory.repository.InventoryRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "reserveStockFallback")
    public Mono<Boolean> reserveStock(String productId, int quantity) {
        return inventoryRepository.findByProductId(productId)
                .flatMap(item -> {
                    if (item.getAvailableQuantity() >= quantity) {
                        item.setReservedQuantity(item.getReservedQuantity() + quantity);
                        return inventoryRepository.save(item)
                                .doOnSuccess(saved -> log.info("Reserved {} units of product {} — available: {}",
                                        quantity, productId, saved.getAvailableQuantity()))
                                .thenReturn(true);
                    } else {
                        log.warn("Insufficient stock for product {}: requested={}, available={}",
                                productId, quantity, item.getAvailableQuantity());
                        return Mono.just(false);
                    }
                })
                .defaultIfEmpty(false);
    }

    public Mono<Boolean> reserveStockFallback(String productId, int quantity, Throwable t) {
        log.error("Circuit breaker triggered for reserveStock: {}", t.getMessage());
        return Mono.just(false);
    }

    public Mono<Void> releaseStock(String productId, int quantity) {
        return inventoryRepository.findByProductId(productId)
                .flatMap(item -> {
                    int newReserved = Math.max(0, item.getReservedQuantity() - quantity);
                    item.setReservedQuantity(newReserved);
                    return inventoryRepository.save(item);
                })
                .doOnSuccess(item -> log.info("Released {} units of product {}", quantity, productId))
                .then();
    }

    public Mono<InventoryItem> getByProductId(String productId) {
        return inventoryRepository.findByProductId(productId);
    }

    public Flux<InventoryItem> getAllItems() {
        return inventoryRepository.findAll();
    }

    public Mono<InventoryItem> addItem(InventoryItem item) {
        return inventoryRepository.save(item);
    }
}
