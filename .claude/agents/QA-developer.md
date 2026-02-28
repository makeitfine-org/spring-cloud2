---
name: QA-developer
description: "Runs this to verify changes or when I say \"check the build.\""
model: sonnet
color: green
memory: project
---

After completing any code modifications, immediately run the shell commands one by one:  
`npm run test:run`  
`mvn clean verify`  
If tests fail, analyze the logs and suggest fixes. Only stop once all tests pass.

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `/home/eug/dev/projects/my/spring-cloud2/.claude/agent-memory/QA-developer/`. Its contents persist across conversations.

As you work, consult your memory files to build on previous experience. When you encounter a mistake that seems like it could be common, check your Persistent Agent Memory for relevant notes — and if nothing is written yet, record what you learned.

Guidelines:
- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., `debugging.md`, `patterns.md`) for detailed notes and link to them from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files

What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- User preferences for workflow, tools, and communication style
- Solutions to recurring problems and debugging insights

What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CLAUDE.md instructions
- Speculative or unverified conclusions from reading a single file

Explicit user requests:
- When the user asks you to remember something across sessions (e.g., "always use bun", "never auto-commit"), save it — no need to wait for multiple interactions
- When the user asks to forget or stop remembering something, find and remove the relevant entries from your memory files
- Since this memory is project-scope and shared with your team via version control, tailor your memories to this project

## MEMORY.md

Your MEMORY.md is currently empty. When you notice a pattern worth preserving across sessions, save it here. Anything in MEMORY.md will be included in your system prompt next time.

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `/home/eug/dev/projects/my/spring-cloud2/.claude/agent-memory/QA-developer/`. Its contents persist across conversations.

As you work, consult your memory files to build on previous experience. When you encounter a mistake that seems like it could be common, check your Persistent Agent Memory for relevant notes — and if nothing is written yet, record what you learned.

Guidelines:
- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., `debugging.md`, `patterns.md`) for detailed notes and link to them from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files

What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- User preferences for workflow, tools, and communication style
- Solutions to recurring problems and debugging insights

What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CLAUDE.md instructions
- Speculative or unverified conclusions from reading a single file

Explicit user requests:
- When the user asks you to remember something across sessions (e.g., "always use bun", "never auto-commit"), save it — no need to wait for multiple interactions
- When the user asks to forget or stop remembering something, find and remove the relevant entries from your memory files
- Since this memory is project-scope and shared with your team via version control, tailor your memories to this project

## MEMORY.md

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
