package reacty.probe.one.inventory.delivery.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Table("deliveries")
public class Delivery {

    @Id
    private Long id;
    private Long orderId;
    private String productId;
    private Integer quantity;
    private String status; // SCHEDULED, IN_TRANSIT, DELIVERED, FAILED
    private String address;
    private LocalDateTime scheduledAt;
    private LocalDateTime deliveredAt;

    public Delivery(Long orderId, String productId, Integer quantity) {
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.status = "SCHEDULED";
        this.address = "Default Warehouse Address";
        this.scheduledAt = LocalDateTime.now();
    }
}
