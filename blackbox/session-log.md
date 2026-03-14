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

<!-- git-snapshot 2026-03-11T13:48:37Z -->
- .mcp.json
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T13:52:41Z -->
- .mcp.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T13:53:07Z -->
- .mcp.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T14:14:45Z -->
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T14:25:04Z -->
- .mcp.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T14:25:35Z -->
- .mcp.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T14:26:13Z -->
- .mcp.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T17:38:45Z -->
- .claude/SKILLS_GUIDE.md
- .claude/agents/flutter-mobile.md
- .claude/agents/flutter-security-expert.md
- .claude/agents/nestjs-api.md
- .claude/agents/nestjs-reviewer.md
- .claude/agents/riverpod-reviewer.md
- .claude/commands/scaffold-flutter-app.md
- .claude/commands/scaffold-nestjs-api.md
- .claude/hookify.design-no-hardcoded-colors-dart.local.md
- .claude/hookify.design-no-raw-form-inputs.local.md
- .claude/hookify.design-no-raw-spacing-dart.local.md
- .claude/hookify.design-no-raw-textstyle-dart.local.md
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/rules/code-standards.md
- .claude/rules/lessons.md
- .claude/rules/leverage-patterns.md
- .claude/rules/verification-and-reporting.md
- .claude/settings.local.json
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T18:14:19Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T18:17:07Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T18:18:48Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T19:01:00Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T19:08:02Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-11T19:13:32Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-12T11:21:02Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-12T12:11:14Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-12T14:01:03Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-12T15:08:34Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.local.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-13T14:19:51Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-13T14:25:54Z -->
- .claude/agents/accessibility-auditor.md
- .claude/agents/agentic-ai-dev.md
- .claude/agents/agentic-ai-reviewer.md
- .claude/agents/angular-spa.md
- .claude/agents/architect.md
- .claude/agents/browser-testing.md
- .claude/agents/code-reviewer.md
- .claude/agents/code-simplifier.md
- .claude/agents/comment-analyzer.md
- .claude/agents/database-designer.md
- .claude/agents/dedup-code-agent.md
- .claude/agents/deployment-engineer.md
- .claude/agents/dx-optimizer.md
- .claude/agents/error-detective.md
- .claude/agents/frontend-design.md
- .claude/agents/java-spring-api.md
- .claude/agents/mermaid-expert.md
- .claude/agents/output-evaluator.md
- .claude/agents/plan-challenger.md
- .claude/agents/postgresql-database-reviewer.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-13T14:47:32Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
<!-- end-snapshot -->

## 2026-03-13T16:00:00+01:00
### Decisions
- Migrated all 31 `.claude/commands/*.md` files into `.claude/skills/<name>/SKILL.md` directory structure
- Deleted `iterate-pr.md` stub (canonical version already existed in skills/)
- Cleaned Flutter/NestJS stack references from `description` fields of: `add-feature`, `security-dependencies`, `security-sast`, `ship`
- Added frontmatter to `lint-design-system.md` (previously had none)
### Constraints Stated by User
- Migrate according to the approved plan exactly; description-field cleanup only (body content unchanged)
### Files Modified
- `.claude/skills/<name>/SKILL.md` (30 new files) — migrated from commands/ directory
- `.claude/SKILLS_GUIDE.md` — updated skill count to 64, added Action Skills table (30 entries) and section
### Deferred
- Body content cleanup of Flutter/NestJS code blocks in ship, security-sast, security-dependencies (only descriptions were in scope)
---

<!-- git-snapshot 2026-03-13T14:51:16Z -->
- .claude/SKILLS_GUIDE.md
- .claude/commands/add-feature.md
- .claude/commands/audit-security.md
- .claude/commands/branch-cleanup.md
- .claude/commands/cancel-ralph.md
- .claude/commands/design-architecture.md
- .claude/commands/design-database.md
- .claude/commands/doc-generate.md
- .claude/commands/hookify-configure.md
- .claude/commands/hookify-list.md
- .claude/commands/hookify.md
- .claude/commands/iterate-pr.md
- .claude/commands/lint-design-system.md
- .claude/commands/plan-review.md
- .claude/commands/pr-risk.md
- .claude/commands/project-status.md
- .claude/commands/promote-lessons.md
- .claude/commands/ralph-loop.md
- .claude/commands/review-code.md
- .claude/commands/review-pr.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-14T10:15:37Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-14T10:17:51Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-14T10:20:18Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-14T10:21:17Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->

<!-- git-snapshot 2026-03-14T10:22:14Z -->
- .claude/hookify/core/__pycache__/__init__.cpython-312.pyc
- .claude/hookify/core/__pycache__/config_loader.cpython-312.pyc
- .claude/hookify/core/__pycache__/rule_engine.cpython-312.pyc
- .claude/settings.json
- blackbox/session-log.md
<!-- end-snapshot -->
