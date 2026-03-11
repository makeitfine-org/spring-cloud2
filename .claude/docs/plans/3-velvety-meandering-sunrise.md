# Plan: Fix Maven Build Failures

## Context

`mvn clean install` fails during the test phase for all three business services (order-service, inventory-service, delivery-service). The root cause is a missing Testcontainers dependency needed for R2DBC + `@ServiceConnection` integration tests.

## Root Cause Analysis

**Error**: `ClassNotFoundException: org.testcontainers.r2dbc.R2DBCDatabaseContainer`

**Error chain**:
```
ClassNotFoundException: org.testcontainers.r2dbc.R2DBCDatabaseContainer
  → BeanInstantiationException: connectionFactory bean
  → BeanCreationException: r2dbcDatabaseClient
  → UnsatisfiedDependencyException: orderRepository / inventoryRepository / deliveryRepository
  → UnsatisfiedDependencyException: OrderService / InventoryService / DeliveryService
  → IllegalStateException: Failed to load ApplicationContext
```

**Why**: All three integration tests use:
```java
@Container
@ServiceConnection
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
```

Spring Boot's `spring-boot-testcontainers` module includes auto-configuration (via `spring.factories`) that bridges `PostgreSQLContainer` to R2DBC connection details. This bridge code references `org.testcontainers.r2dbc.R2DBCDatabaseContainer` from the `testcontainers:r2dbc` module. Since that module is absent from the classpath, Spring fails when loading the application context for every test.

**Missing dependency** (in all 3 service pom.xml files):
```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>r2dbc</artifactId>
    <scope>test</scope>
</dependency>
```

The `testcontainers-bom` at version `1.20.4` is already imported in the parent pom, so no explicit version is required.

## Files to Modify

1. `order-service/pom.xml` — add `testcontainers:r2dbc` test dependency
2. `inventory-service/pom.xml` — add `testcontainers:r2dbc` test dependency
3. `delivery-service/pom.xml` — add `testcontainers:r2dbc` test dependency

Each file already has identical test dependency blocks (lines 78–108 in each). The new dependency will be added alongside the existing `testcontainers` dependencies.

## Implementation Steps

For each of the three service pom.xml files, add after the `kafka` testcontainers dependency:

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>r2dbc</artifactId>
    <scope>test</scope>
</dependency>
```

## Verification

Run: `mvn clean install`

Expected outcome:
- All 3 services compile and pass their integration tests
- Order service: 8 tests pass (CRUD + Kafka saga events)
- Inventory service: 6 tests pass (CRUD + order-created handling)
- Delivery service: 5 tests pass (CRUD + inventory-reserved handling)
- BUILD SUCCESS
