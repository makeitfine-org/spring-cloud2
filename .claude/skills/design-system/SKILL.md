---
name: design-system
description: "Design system enforcement for Angular. Routes all UI tasks through the correct stack-specific tokens, rules, and interaction contracts. Use when auditing UI compliance, reviewing design consistency, or building any user-facing surface."
allowed-tools: Read, Glob, Grep, Write, Edit
metadata:
  triggers: design system, UI audit, design tokens, design review, design lint, visual consistency, theme compliance, design drift
  related-skills: angular-spa, frontend-design, accessibility-auditor
  domain: frontend
  role: specialist
  scope: design
  output-format: document
---

# Design System — Unified Routing Hub

Single entry point for all design system enforcement for Angular.

**When to use:** Any UI task — building screens, reviewing components, auditing design drift, or running design lint.

## Routing Table

Determine the stack from file context, then load the correct references:

```
What are you working on?
    |
    +-- Angular (src/app/**/*.ts|html|scss)
    |   |
    |   +-- Component styling (daisyUI classes, semantic tokens)
    |   |   → Read: .claude/skills/angular-spa/reference/daisyui-v5-components.md
    |   |
    |   +-- Tailwind config (spacing, breakpoints, CSS vars)
    |   |   → Read: .claude/skills/angular-spa/reference/tailwind-v4-config.md
    |   |
    |   +-- Conventions (design principles, form patterns)
    |   |   → Read: .claude/skills/angular-spa/reference/angular-conventions.md
    |   |
    |   +-- Animations (timing, keyframes, reduced motion)
    |       → Read: .claude/skills/angular-spa/reference/animations.md
    |
    +-- Cross-cutting (interaction contracts, visual direction)
        |
        +-- Surface/interaction contracts (modals, forms, lists, errors)
        |   → Read: .claude/skills/design-system/reference/interaction-contracts.md
        |
        +-- Visual design direction (anti-patterns, typography philosophy)
            → Read: .claude/skills/frontend-design/reference/frontend-design-principles.md
```

## Design Rules — Hard Policy (Both Stacks)

These are non-negotiable. Violations are caught by hookify rules at write-time.

### Colors
- **NEVER** hardcode hex values (`#3b82f6`)
- **NEVER** use `rgb()`, `rgba()`, `hsl()`, `hsla()` literals
- **Angular:** Use daisyUI semantic tokens (`bg-primary`, `text-base-content`)

### Spacing
- **NEVER** use raw numeric spacing (`mt-3`)
- **Angular:** Use Tailwind semantic scale or daisyUI component spacing

### Typography
- **NEVER** use raw font sizes (`text-[14px]`)
- **Angular:** Use Tailwind typography scale (`text-sm`, `text-lg`, `text-xl`)

### Forms
- **NEVER** use bare `<input>`, `<select>`, `<textarea>` without framework bindings
- **Angular:** Use daisyUI form classes + reactive form `formControlName`

### Touch Targets
- **Minimum 44px** for all interactive elements

### Inline Styles
- **NEVER** use `style="..."` in Angular templates — use Tailwind utilities or SCSS

## Machine Enforcement

### Hookify Rules (fire on every Write/Edit by Claude)

| Rule | Stack | What It Catches |
|------|-------|-----------------|
| `hookify.design-no-hex-angular` | Angular | `bg-[#...]`, `color: #...`, `rgb()`, `hsl()` |
| `hookify.design-no-raw-spacing-angular` | Angular | `mt-3`, `px-4`, `gap-2` |
| `hookify.design-no-raw-typography-angular` | Angular | `text-[14px]`, `font-[...]`, `font-size: N` |
| `hookify.design-no-raw-form-inputs` | Angular | bare `<input>`, `<select>` without `formControl` |

All rules respect `// ignore-design: [reason]` exception markers.

### Lint Commands

| Command | Scope |
|---------|-------|
| `/lint-design-system` | Orchestrator — runs all checks for Angular |
| `ng lint` | Angular static analysis |

### Quality Gate

Before declaring any UI work done, these must pass (from `verification-and-reporting.md`):

- [ ] No hardcoded colors — all colors use daisyUI semantic tokens
- [ ] No raw spacing values — all spacing uses Tailwind semantic scale
- [ ] No raw font sizes — all typography uses Tailwind scale
- [ ] Touch targets >= 44px for all interactive elements
- [ ] `/lint-design-system` run with zero violations
- [ ] Exception markers (`<!-- ignore-design: [reason] -->`) reviewed and justified

## Exception Policy

When a design rule must be violated intentionally:

1. Add inline marker: `// ignore-design: [short reason]` or `<!-- ignore-design: [reason] -->`
2. Reason must explain WHY (e.g., "platform-specific iOS styling", "third-party widget constraint")
3. Exceptions are reviewed like code debt
4. Periodically audit: search for `ignore-design` and remove stale exceptions
5. If 5+ exceptions accumulate in one file → the design system may need extending, flag it

## Scope & Rationale

### What We Enforce

| Surface | Status | Rationale |
|---------|--------|-----------|
| **Logged-in app screens** (Angular) | ENFORCED | Primary user experience — consistency here drives retention and trust |
| **Shared/reusable components** | ENFORCED | Foundation — drift here cascades everywhere |
| **Theme definitions** | ENFORCED | Single source of truth for tokens |

### What We Defer

| Surface | Status | Rationale |
|---------|--------|-----------|
| **Admin panels / internal tools** | DEFERRED | Lower user impact — enforce when dedicated redesign pass happens |
| **Legacy/migration pages** | DEFERRED | Will be replaced — enforce on new version only |
| **Marketing / landing pages** | DEFERRED | Often need custom creative direction that conflicts with app tokens |
| **Test files** | EXCLUDED | Test code can use raw values for assertion clarity |

### File Path Scope

| Stack | Included | Excluded |
|-------|----------|----------|
| Angular | `src/app/` | `node_modules/`, `*.spec.ts`, config files, build output |
