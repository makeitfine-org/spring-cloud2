package reacty.probe.one.inventory.order.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
@Table("orders")
public class Order {

    @Id
    private Long id;
    private String productId;
    private Integer quantity;
    private BigDecimal price;
    private String status; // PENDING, CONFIRMED, CANCELLED
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order(String productId, Integer quantity, BigDecimal price) {
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(String status) { this.status = status; this.updatedAt = LocalDateTime.now(); }
}
