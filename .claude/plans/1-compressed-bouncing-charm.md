# Plan: Improvements, Optimizations & Testcontainers Integration Tests

## Context

The project is a production-ready reactive Spring Cloud microservices system with a choreography-based Saga pattern. While the production code is functional, it has several gaps: missing 404 handling, no `updatedAt` refresh, overly permissive Kafka deserializer config, unhandled Kafka send futures, and zero tests. This plan addresses all identified improvements and adds a complete Testcontainers-based integration test suite for all services.

---

## Part 1: Production Code Improvements

### 1.1 Root `pom.xml` — Add Test Dependency Management
**File:** `/home/eug/dev/projects/my/spring-cloud2/pom.xml`

Add `testcontainers.version` property and a `<dependencyManagement>` block importing the Testcontainers BOM, plus shared test dependencies:
```xml
<testcontainers.version>1.20.4</testcontainers.version>
```
In `dependencyManagement > dependencies`:
- `org.testcontainers:testcontainers-bom:${testcontainers.version}` (type=pom, scope=import)

### 1.2 Business Service `pom.xml` (order, inventory, delivery) — Add Test Dependencies
Each of the 3 business service poms gets:
- `spring-boot-starter-test` (test scope) — includes JUnit 5, Mockito, AssertJ
- `reactor-test` (test scope) — `StepVerifier` for reactive streams
- `spring-boot-testcontainers` (test scope) — `@ServiceConnection` support
- `testcontainers:junit-jupiter` (test scope)
- `testcontainers:postgresql` (test scope) — PostgreSQL container
- `testcontainers:kafka` (test scope) — Kafka container

Files:
- `/home/eug/dev/projects/my/spring-cloud2/order-service/pom.xml`
- `/home/eug/dev/projects/my/spring-cloud2/inventory-service/pom.xml`
- `/home/eug/dev/projects/my/spring-cloud2/delivery-service/pom.xml`

### 1.3 API Gateway `pom.xml` — Add Test Dependencies (no DB/Kafka needed)
- `spring-boot-starter-test` (test scope)

File: `/home/eug/dev/projects/my/spring-cloud2/api-gateway/pom.xml`

### 1.4 Fix Missing `updatedAt` in `updateOrderStatus`
**File:** `order-service/src/main/java/reacty/probe/one/inventory/order/service/OrderService.java`

`updateOrderStatus()` sets `status` and `failureReason` but never refreshes `updatedAt`. Add `order.setUpdatedAt(LocalDateTime.now())` before save.

### 1.5 Restrict Kafka `TRUSTED_PACKAGES`
**Files:** `KafkaConfig.java` in all 3 services

Change `JsonDeserializer.TRUSTED_PACKAGES` from `"*"` → `"reacty.probe.one.inventory.*"` in all consumer factory definitions.
- `order-service/src/main/java/reacty/probe/one/inventory/order/config/KafkaConfig.java` (3 consumer factories)
- `inventory-service/src/main/java/reacty/probe/one/inventory/inventory/config/KafkaConfig.java`
- `delivery-service/src/main/java/reacty/probe/one/inventory/delivery/config/KafkaConfig.java`

### 1.6 Handle Kafka `send()` Future
**Files:** `OrderService.java`, `SagaEventProducer.java` in inventory and delivery

`kafkaTemplate.send()` returns a `CompletableFuture`. Attach `.whenComplete()` to log send errors instead of silently dropping them.
- `order-service/src/main/java/reacty/probe/one/inventory/order/service/OrderService.java` (line 41)
- `inventory-service/src/main/java/reacty/probe/one/inventory/inventory/event/SagaEventProducer.java`
- `delivery-service/src/main/java/reacty/probe/one/inventory/delivery/event/SagaEventProducer.java`

### 1.7 Proper 404 Responses in Controllers
All three controllers return an empty `200 OK` when a resource is not found. Fix by adding `.switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))`.

Files:
- `order-service/.../controller/OrderController.java` — `getOrder()` endpoint
- `inventory-service/.../controller/InventoryController.java` — `getByProductId()` endpoint
- `delivery-service/.../controller/DeliveryController.java` — `getById()` and `getByOrderId()` endpoints

---

## Part 2: Integration Tests with Testcontainers

### Test Configuration per Service
Each business service gets `src/test/resources/application-test.yml` to disable external dependencies during tests:
```yaml
eureka:
  client:
    enabled: false
spring:
  sql:
    init:
      mode: always
management:
  tracing:
    enabled: false
```

### 2.1 Order Service Integration Test
**File:** `order-service/src/test/java/reacty/probe/one/inventory/order/OrderServiceIntegrationTest.java`

Setup:
- `@SpringBootTest(webEnvironment = RANDOM_PORT)`
- `@Testcontainers`
- `@ActiveProfiles("test")`
- Static `@Container @ServiceConnection PostgreSQLContainer` (postgres:16-alpine)
- Static `@Container @ServiceConnection KafkaContainer` (confluentinc/cp-kafka:7.6.0)
- `@AutoConfigureWebTestClient`
- Inject `OrderRepository` to verify DB state
- Inject `KafkaTemplate` to send test saga events

Test cases:
1. `createOrder_returnsPendingOrder` — POST `/api/orders` → 201, status=PENDING
2. `createOrder_publishesOrderCreatedEvent` — verify event on `order-created` topic via `KafkaConsumer`
3. `getOrder_existingId_returnsOrder` — GET `/api/orders/{id}` → 200
4. `getOrder_nonExistingId_returns404` — GET `/api/orders/9999` → 404
5. `getAllOrders_returnsAll` — GET `/api/orders` → 200 with list
6. `handleInventoryReserved_updatesStatusToInventoryReserved` — publish `InventoryReservedEvent` → poll until order status = INVENTORY_RESERVED
7. `handleInventoryFailed_updatesStatusToCancelled` — publish `InventoryFailedEvent` → poll until status = CANCELLED
8. `handleDeliveryScheduled_updatesStatusToConfirmed` — publish `DeliveryScheduledEvent` → poll until status = CONFIRMED

### 2.2 Inventory Service Integration Test
**File:** `inventory-service/src/test/java/reacty/probe/one/inventory/inventory/InventoryServiceIntegrationTest.java`

Setup: Same Testcontainers pattern (PostgreSQL + Kafka).

Test cases:
1. `getInventoryItem_existingProduct_returnsItem` — GET `/api/inventory/prod-1` → 200 (seeded data)
2. `getInventoryItem_nonExistingProduct_returns404` — GET `/api/inventory/unknown` → 404
3. `addInventoryItem_createsItem` — POST `/api/inventory` → 201
4. `getAllItems_returnsSeededItems` — GET `/api/inventory` → includes prod-1, prod-2, prod-3
5. `handleOrderCreated_sufficientStock_publishesInventoryReserved` — publish `OrderCreatedEvent` for prod-1 qty=5 → verify `inventory-reserved` event, verify `reserved_quantity` increased
6. `handleOrderCreated_insufficientStock_publishesInventoryFailed` — publish `OrderCreatedEvent` for prod-2 qty=100 (> 50) → verify `inventory-failed` event

### 2.3 Delivery Service Integration Test
**File:** `delivery-service/src/test/java/reacty/probe/one/inventory/delivery/DeliveryServiceIntegrationTest.java`

Setup: Same Testcontainers pattern (PostgreSQL + Kafka).

Test cases:
1. `getAllDeliveries_returnsEmpty` — GET `/api/deliveries` → 200 empty list
2. `getDelivery_nonExistingId_returns404` — GET `/api/deliveries/9999` → 404
3. `getDeliveryByOrder_nonExistingOrderId_returns404` — GET `/api/deliveries/order/9999` → 404
4. `handleInventoryReserved_schedulesDelivery` — publish `InventoryReservedEvent` → verify delivery record created with SCHEDULED status, verify `delivery-scheduled` event published
5. `getDelivery_afterScheduling_returnsDelivery` — GET `/api/deliveries/{id}` → 200 after saga message

### 2.4 API Gateway Fallback Test
**File:** `api-gateway/src/test/java/reacty/probe/one/inventory/gateway/FallbackControllerTest.java`

Setup:
- `@WebFluxTest(FallbackController.class)` — lightweight slice test, no containers needed

Test cases:
1. `ordersFallback_returnsServiceUnavailable` — GET `/fallback/orders` → 503
2. `inventoryFallback_returnsServiceUnavailable` — GET `/fallback/inventory` → 503
3. `deliveriesFallback_returnsServiceUnavailable` — GET `/fallback/deliveries` → 503

---

## Implementation Order

1. **Root pom.xml** — add Testcontainers BOM + `testcontainers.version`
2. **Business service poms** — add test dependencies
3. **API Gateway pom** — add `spring-boot-starter-test`
4. **Production fixes** — updatedAt, trusted packages, 404 handling, Kafka futures
5. **Test resources** — `application-test.yml` per service
6. **OrderServiceIntegrationTest** — most complex (full saga)
7. **InventoryServiceIntegrationTest**
8. **DeliveryServiceIntegrationTest**
9. **FallbackControllerTest** — gateway

---

## Verification

```bash
# Run all tests
mvn test

# Run per-service
mvn test -pl order-service
mvn test -pl inventory-service
mvn test -pl delivery-service
mvn test -pl api-gateway

# Check that production code still compiles and runs
mvn clean package -DskipTests
docker compose up --build
```

Saga flow verification: POST `/api/orders` → poll `GET /api/orders/{id}` until status = CONFIRMED (should happen within ~3-5s when stack is fully up).
