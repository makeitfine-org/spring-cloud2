package reacty.probe.one.inventory.order.repository;

import reacty.probe.one.inventory.order.model.Order;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface OrderRepository extends ReactiveCrudRepository<Order, Long> {

    Flux<Order> findByProductId(String productId);

    Flux<Order> findByStatus(String status);
}
