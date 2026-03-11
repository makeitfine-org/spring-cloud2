# Lombok Refactoring Implementation Plan

## Context
This plan introduces Lombok to the Spring Cloud 2025 microservices project to eliminate boilerplate code in R2DBC entity classes. The project currently has no Lombok dependency and contains 3 entity classes with significant boilerplate (18-46+ lines) that can be safely refactored.

## Current State
- **Lombok Status:** Not in dependencies
- **Refactoring Targets:** 3 R2DBC entity classes
  - `Order.java` (order-service): 8 fields, ~18 lines boilerplate
  - `InventoryItem.java` (inventory-service): 4 fields, ~10 lines boilerplate
  - `Delivery.java` (delivery-service): 8 fields, ~18 lines boilerplate
- **Other Classes:** Event classes already use Java records (no refactoring needed), controllers/services have minimal boilerplate
- **Expected Savings:** ~46+ lines of boilerplate across all 3 entities

## Implementation Approach

### Phase 1: Parent POM Configuration
**File:** `/home/eug/dev/projects/my/spring-cloud2/pom.xml`

Add Lombok 1.18.30 to dependency management and Maven compiler plugin:
- Add `<dependency>` in `<dependencyManagement>` with scope `provided`
- Add annotation processor path in Maven compiler plugin configuration
- Version: 1.18.30 (stable, fully compatible with Spring Boot 3.5.1, Java 21, R2DBC)

### Phase 2: Refactor Inventory Service (Simplest)
**File:** `/home/eug/dev/projects/my/spring-cloud2/inventory-service/src/main/java/reacty/probe/one/inventory/inventory/model/InventoryItem.java`

Apply annotations:
```java
@Data
@NoArgsConstructor
public class InventoryItem { ... }
```

Special handling:
- Keep custom 2-arg constructor: `public InventoryItem(String productId, Integer quantity)`
- Preserve custom method: `getAvailableQuantity()`
- Keep `@Id` on id field

Verification:
- Build: `mvn clean package -DskipTests -pl inventory-service`
- Test: `mvn test -pl inventory-service`
- Verify: InventoryServiceIntegrationTest passes

**User Approval Required Before Proceeding to Phase 3**

### Phase 3: Refactor Order Service (Most Complex)
**File:** `/home/eug/dev/projects/my/spring-cloud2/order-service/src/main/java/reacty/probe/one/inventory/order/model/Order.java`

Apply annotations:
```java
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Order { ... }
```

Critical handling:
- Keep custom `setStatus(String status)` method with updatedAt side-effect
- Keep custom 3-arg constructor: `public Order(String productId, Integer quantity, BigDecimal price)`
- Preserve `@Id` on id field
- Preserve `@CreationTimestamp` and `@UpdateTimestamp` if present

Verification:
- Build: `mvn clean package -DskipTests -pl order-service`
- Test: `mvn test -pl order-service`
- Verify: OrderServiceIntegrationTest passes, especially status update logic (lines 220, 246, 271)

**User Approval Required Before Proceeding to Phase 4**

### Phase 4: Refactor Delivery Service
**File:** `/home/eug/dev/projects/my/spring-cloud2/delivery-service/src/main/java/reacty/probe/one/inventory/delivery/model/Delivery.java`

Apply annotations:
```java
@Data
@NoArgsConstructor
public class Delivery { ... }
```

Special handling:
- Keep custom 3-arg constructor: `public Delivery(Long orderId, String productId, Integer quantity)`
- Preserve `@Id` on id field

Verification:
- Build: `mvn clean package -DskipTests -pl delivery-service`
- Test: `mvn test -pl delivery-service`
- Verify: DeliveryServiceIntegrationTest passes

**User Approval Required Before Full Integration Testing**

### Phase 5: Full Integration & Verification
- Build entire project: `mvn clean package -DskipTests`
- Run all tests: `mvn test` (expect all 22 tests to pass)
- Optional: Docker stack verification: `mvn clean package -DskipTests && docker compose up --build`

## Key Considerations

**R2DBC Compatibility:**
- `@NoArgsConstructor` satisfies R2DBC's row-to-entity mapping requirement
- Lombok-generated setters work identically with Spring Data R2DBC
- No special R2DBC annotations needed

**Custom Logic Preservation:**
- Order.setStatus() has timestamp side-effect - must keep manual implementation
- InventoryItem.getAvailableQuantity() is a computed field - preserved automatically
- Custom constructors remain as separate overloads outside Lombok generation

**Build & Test Safety:**
- All changes are compile-time only (Lombok scope: provided)
- Integration tests validate entity instantiation, persistence, and serialization
- Zero runtime performance impact

## Critical Files to Modify

1. `/home/eug/dev/projects/my/spring-cloud2/pom.xml` - Add Lombok dependency
2. `/home/eug/dev/projects/my/spring-cloud2/inventory-service/.../InventoryItem.java` - Phase 2
3. `/home/eug/dev/projects/my/spring-cloud2/order-service/.../Order.java` - Phase 3
4. `/home/eug/dev/projects/my/spring-cloud2/delivery-service/.../Delivery.java` - Phase 4

## Verification Steps

After each phase:
1. Run module-specific build: `mvn clean package -DskipTests -pl [module-name]`
2. Run module-specific tests: `mvn test -pl [module-name]`
3. Confirm no Lombok compilation warnings
4. Confirm no entity instantiation errors

After all phases:
1. Full build: `mvn clean package -DskipTests`
2. All tests: `mvn test` (expect all 22 tests to pass)
3. Optional Docker stack test

## Expected Benefits

- **Code Reduction:** ~46+ lines eliminated across 3 entity classes (48% boilerplate reduction)
- **Readability:** Clear intent with annotations; reduced cognitive load
- **Maintainability:** Easier to add/modify fields (annotation-driven)
- **Compatibility:** Zero impact on functionality; all existing tests should pass
- **Performance:** Zero runtime overhead (compile-time only)

## Rollback Plan

If issues arise at any phase:
- Undo Lombok annotations from entity class
- Run tests to verify rollback
- No dependency changes are risky (provided scope)
