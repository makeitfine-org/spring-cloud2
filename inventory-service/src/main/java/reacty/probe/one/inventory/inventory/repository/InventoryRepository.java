package reacty.probe.one.inventory.inventory.repository;

import reacty.probe.one.inventory.inventory.model.InventoryItem;
import org.springframework.data.r2dbc.repository.Modifying;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface InventoryRepository extends ReactiveCrudRepository<InventoryItem, Long> {

    Mono<InventoryItem> findByProductId(String productId);

    @Modifying
    @Query("""
            UPDATE inventory_items
               SET reserved_quantity = reserved_quantity + :quantity
             WHERE product_id = :productId
               AND (quantity - reserved_quantity) >= :quantity
            """)
    Mono<Integer> atomicReserve(String productId, int quantity);
}
