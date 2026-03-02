# Test Automation Agent Memory

## Order Status Update Fix (Fixed 2026-02-27)

**Problem**: Test `handleDeliveryScheduled_updatesStatusToConfirmed` was timing out after 15 seconds. Kafka listener was blocking indefinitely on `.block()` call.

**Root Cause**: In `OrderService.updateOrderStatus()`, when order not found, the code returned `Mono.empty()` via `.switchIfEmpty(Mono.fromRunnable(...).then(Mono.empty()))`. This means no value was emitted, causing the listener's `.block()` to hang indefinitely.

**Solution**: Changed `switchIfEmpty()` to return `Mono.error()` instead of `Mono.empty()`.

**Key Takeaway**: When blocking on Mono in try-catch blocks, ensure the Mono can always complete - never return `Mono.empty()` when an error occurs. Use `Mono.error()` to allow the try-catch to catch exceptions properly.

## H2 Schema Compatibility for Fast Tests (Fixed 2026-03-02)

**Problem**: `InventoryServiceFastTest` failed with `ApplicationContext` load failure. H2 R2DBC driver does not support `ON CONFLICT (product_id) DO NOTHING` even in `MODE=PostgreSQL`.

**Root Cause 1**: `spring.sql.init.mode: always` in `application-fast.yml` caused Spring Boot's auto `r2dbcScriptDatabaseInitializer` to load the production `schema.sql` (with `ON CONFLICT`) against H2.

**Fix 1**: Set `spring.sql.init.mode: never` in `inventory-service/src/test/resources/application-fast.yml`. The test's `H2SchemaConfig` `@TestConfiguration` bean handles schema init via `schema-h2.sql`.

**Root Cause 2**: `schema-h2.sql` itself also contained `ON CONFLICT ... DO NOTHING`.

**Fix 2**: Remove `ON CONFLICT (product_id) DO NOTHING` from `inventory-service/src/test/resources/schema-h2.sql`. H2 starts empty each test — no conflicts possible.

**Rule**: For H2 `schema-h2.sql` files — never use PostgreSQL-specific syntax. H2's `MODE=PostgreSQL` does NOT support `ON CONFLICT` via R2DBC driver.

**Rule**: When a service's `schema.sql` has PostgreSQL-only seed data (`ON CONFLICT`), set `spring.sql.init.mode: never` in `application-fast.yml` and let the test's `@TestConfiguration` handle schema init with H2-compatible SQL.

## Fast Test Architecture (as of 2026-03-02)

- `*FastTest.java` — embedded Kafka + H2, no Docker needed, run by `mvn test`
- `*IT.java` (formerly `*IntegrationTest.java`) — Testcontainers, require Docker, excluded from Surefire
- Surefire exclusion pattern: `**/*IT.java` (configured in root `pom.xml`)
- Fast test profile name: `fast` (set via `@ActiveProfiles("fast")`)
- Each service's `src/test/resources/application-fast.yml` configures H2 R2DBC URL and disables Eureka/Zipkin
- Each service's `src/test/resources/schema-h2.sql` contains H2-compatible DDL

**Test Count (all passing, mvn test, no Docker)**:
- API Gateway: 3 unit tests (`FallbackControllerTest`)
- Order Service: 8 fast tests (`OrderServiceFastTest`)
- Inventory Service: 6 fast tests (`InventoryServiceFastTest`)
- Delivery Service: 5 fast tests (`DeliveryServiceFastTest`)
- Total: 22 tests, BUILD SUCCESS
