package reacty.probe.one.inventory.delivery.controller;

import reacty.probe.one.inventory.delivery.model.Delivery;
import reacty.probe.one.inventory.delivery.service.DeliveryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/{id}")
    public Mono<Delivery> getById(@PathVariable Long id) {
        return deliveryService.getById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping("/order/{orderId}")
    public Mono<Delivery> getByOrderId(@PathVariable Long orderId) {
        return deliveryService.getByOrderId(orderId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping
    public Flux<Delivery> getAll() {
        return deliveryService.getAllDeliveries();
    }
}
