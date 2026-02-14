package reacty.probe.one.inventory.inventory.repository;

import reacty.probe.one.inventory.inventory.model.InventoryItem;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface InventoryRepository extends ReactiveCrudRepository<InventoryItem, Long> {

    Mono<InventoryItem> findByProductId(String productId);
}
