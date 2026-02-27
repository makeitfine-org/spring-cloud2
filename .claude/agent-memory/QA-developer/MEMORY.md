# Test Automation Agent Memory

## Order Status Update Fix (Fixed 2026-02-27)

**Problem**: Test `handleDeliveryScheduled_updatesStatusToConfirmed` was timing out after 15 seconds. Kafka listener was blocking indefinitely on `.block()` call.

**Root Cause**: In `OrderService.updateOrderStatus()`, when order not found, the code returned `Mono.empty()` via `.switchIfEmpty(Mono.fromRunnable(...).then(Mono.empty()))`. This means no value was emitted, causing the listener's `.block()` to hang indefinitely.

**Solution**: Changed `switchIfEmpty()` to return `Mono.error()` instead of `Mono.empty()`:
```java
.switchIfEmpty(Mono.defer(() -> {
    log.error("Order {} not found when trying to update status to {}", orderId, status);
    return Mono.error(new IllegalStateException("Order not found: " + orderId));
}))
```

This allows the listener's try-catch block to catch the exception and the `.block()` call to complete properly.

**File Modified**: `/home/eug/dev/projects/my/spring-cloud2/order-service/src/main/java/reacty/probe/one/inventory/order/service/OrderService.java` (line 64-79)

**Test Status**: All 22 tests passing (3 unit + 19 integration):
- API Gateway: 3 tests
- Order Service: 8 tests
- Inventory Service: 6 tests
- Delivery Service: 5 tests
- Total: 22/22 passing, BUILD SUCCESS

## Key Takeaway for QA Testing
When blocking on Mono in try-catch blocks, ensure the Mono can always complete - never return `Mono.empty()` when an error occurs. Use `Mono.error()` to allow the try-catch to catch exceptions properly.
