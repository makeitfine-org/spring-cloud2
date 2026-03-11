# Blackbox — Session Log
# Append-only. See .claude/rules/blackbox-policy.md

<!-- git-snapshot 2026-03-11T10:48:29Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T10:49:21Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- CLAUDE.md
<!-- end-snapshot -->

## 2026-03-11T11:25:00Z
### Decisions
- Migrated `ui/` from React 18.3/Vite/RTK Query to Angular 21/Vitest/RxJS+Signals
- Angular 21 CLI generates with Vitest (not Karma) — plan incorrectly assumed Karma; kept Vitest
- `fakeAsync` not available in zoneless Vitest; all component specs use `async/await + whenStable()`
- `${{ expr }}` in template literals is invalid (JS template interpolation conflict); used method `formatPrice()` instead
- `provideZonelessChangeDetection()` added to all TestBed setups (required for tests even though it's app default)
### Constraints Stated by User
- None beyond plan spec
### Files Modified
- `ui/` (entire directory replaced): Angular 21 SPA replacing React 18
- `blackbox/session-log.md` — this entry
### Deferred
- Manual E2E smoke test (create order → saga → CONFIRMED in 5s polling)
---

<!-- git-snapshot 2026-03-11T11:25:59Z -->
- blackbox/session-log.md
- ui/README.md
- ui/index.html
- ui/package-lock.json
- ui/package.json
- ui/src/App.tsx
- ui/src/app/store.ts
- ui/src/components/ErrorBanner.test.tsx
- ui/src/components/ErrorBanner.tsx
- ui/src/components/Layout.tsx
- ui/src/components/Navbar.tsx
- ui/src/components/StatusBadge.test.tsx
- ui/src/components/StatusBadge.tsx
- ui/src/features/dashboard/Dashboard.test.tsx
- ui/src/features/dashboard/Dashboard.tsx
- ui/src/features/deliveries/DeliveriesList.tsx
- ui/src/features/inventory/InventoryList.test.tsx
- ui/src/features/inventory/InventoryList.tsx
- ui/src/features/orders/CreateOrderForm.test.tsx
- ui/src/features/orders/CreateOrderForm.tsx
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T11:32:57Z -->
- blackbox/session-log.md
- ui/README.md
- ui/index.html
- ui/package-lock.json
- ui/package.json
- ui/src/App.tsx
- ui/src/app/store.ts
- ui/src/components/ErrorBanner.test.tsx
- ui/src/components/ErrorBanner.tsx
- ui/src/components/Layout.tsx
- ui/src/components/Navbar.tsx
- ui/src/components/StatusBadge.test.tsx
- ui/src/components/StatusBadge.tsx
- ui/src/features/dashboard/Dashboard.test.tsx
- ui/src/features/dashboard/Dashboard.tsx
- ui/src/features/deliveries/DeliveriesList.tsx
- ui/src/features/inventory/InventoryList.test.tsx
- ui/src/features/inventory/InventoryList.tsx
- ui/src/features/orders/CreateOrderForm.test.tsx
- ui/src/features/orders/CreateOrderForm.tsx
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T13:41:03Z -->
- .mcp.json
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T13:41:42Z -->
- .mcp.json
- blackbox/session-log.md
- ui/Dockerfile
<!-- end-snapshot -->
