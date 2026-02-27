package reacty.probe.one.inventory.inventory.controller;

import reacty.probe.one.inventory.inventory.model.InventoryItem;
import reacty.probe.one.inventory.inventory.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}")
    public Mono<InventoryItem> getByProductId(@PathVariable String productId) {
        return inventoryService.getByProductId(productId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @GetMapping
    public Flux<InventoryItem> getAll() {
        return inventoryService.getAllItems();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<InventoryItem> addItem(@RequestBody InventoryItem item) {
        return inventoryService.addItem(item);
    }
}
