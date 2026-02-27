package reacty.probe.one.inventory.inventory.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@NoArgsConstructor
@Table("inventory_items")
public class InventoryItem {

    @Id
    private Long id;
    private String productId;
    private Integer quantity;
    private Integer reservedQuantity;

    public InventoryItem(String productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
        this.reservedQuantity = 0;
    }

    public int getAvailableQuantity() {
        return quantity - reservedQuantity;
    }
}
