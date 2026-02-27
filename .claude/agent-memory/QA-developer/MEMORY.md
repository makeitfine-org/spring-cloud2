# Test Automation Agent Memory

## Kafka Listener Error Handling (Fixed 2026-02-27)

**Problem**: Integration tests for order-service were timing out waiting for Kafka event listeners to process messages. Tests `handleInventoryReserved_updatesStatusToInventoryReserved`, `handleInventoryFailed_updatesStatusToCancelled`, and `handleDeliveryScheduled_updatesStatusToConfirmed` would timeout after 15 seconds even though events were published to Kafka.

**Root Cause**: The Kafka listener container factories lacked proper error handlers. When exceptions occurred during message deserialization or processing (including Kafka consumer group coordination issues during test rebalancing), errors were silently swallowed, preventing message processing and leaving no diagnostic logs.

**Solution**: Added `DefaultErrorHandler` with logging to all three Kafka listener container factories in `KafkaConfig.java`:
- `inventoryReservedListenerFactory`
- `inventoryFailedListenerFactory`
- `deliveryScheduledListenerFactory`

Each handler logs exceptions to ERROR level with details about the failed message, enabling proper error diagnosis.

**File Modified**: `/home/eug/dev/projects/my/spring-cloud2/order-service/src/main/java/reacty/probe/one/inventory/order/config/KafkaConfig.java`

**Test Status**: All 8 integration tests in `OrderServiceIntegrationTest` now pass consistently.

## Key Takeaway for QA Testing
Always ensure Kafka listener containers have error handlers configured - silent failures make tests flaky and hard to debug. The error handler prevents silent message drops during consumer group rebalancing or deserialization errors.
