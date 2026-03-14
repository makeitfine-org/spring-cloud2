# Plan: Improve CLAUDE.md Based on Project Analysis

## Context

CLAUDE.md is the primary configuration and orientation document loaded every session. Several sections are stale or incomplete relative to the actual project state:
- The slash commands column is misleading (`.claude/commands/` is **empty** — all commands were migrated to skills)
- Infrastructure table omits Kafka UI and Zipkin (both present in `docker-compose.yml`)
- MCP tools list omits `mcp__postgres-order__query`
- Skills table lists only ~13 skills; 64 actually exist (per `SKILLS_GUIDE.md`)
- Code Review Agents table omits 12+ agents present in `.claude/agents/`
- Common Commands section has no mention of key skill-based slash commands
- No reference to `SKILLS_GUIDE.md` as the canonical skills catalog

## Changes

### 1. Services Table — Add Infrastructure Services

Current table omits Kafka UI and Zipkin. Add rows:

| Service | Port | Role |
|---------|------|------|
| kafka-ui | 8090 | Kafka topic/consumer browser (provectuslabs/kafka-ui) |
| zipkin | 9411 | Distributed tracing UI |

### 2. MCP Tools — Add postgres-order

Current text: `mcp__postgres-delivery__query`, `mcp__postgres-inventory__query`
Add: `mcp__postgres-order__query`

### 3. Code Conventions Table — Rename "Command" → "Slash Command" + Add Missing Skills

`.claude/commands/` is **empty** — all slash commands live in `.claude/skills/` and are invoked with `/skill-name`. The column header "Command" is accurate but its relationship to the skills system needs clarity.

Add a note that `.claude/commands/` is empty and all commands are skills.

Add missing important skills to table:
- `java-coding-standard` — Java naming, immutability, Optional, streams
- `agentic-ai-coding-standard` — LangChain/LangGraph standards
- `test-driven-development` — TDD Red-Green-Refactor
- `pr-risk` → `/pr-risk`
- `iterate-pr` → `/iterate-pr`
- `pr-review` → `/review-pr`
- `status-check` → `/status-check`
- `receiving-code-review` — before implementing feedback
- `threat-modeling` — STRIDE / attack trees
- `sast-configuration` — static analysis setup
- `ddd-architect` — DDD bounded contexts / domain model
- `openapi-spec-generation` → API docs

Add reference: `> Full catalog: .claude/SKILLS_GUIDE.md — 64 skills across 8 domains`

### 4. Code Review Agents Table — Add Missing Agents

Add missing agents that are present in `.claude/agents/`:

| Domain | Reviewer Agent |
|--------|----------------|
| Silent failures / swallowed exceptions | `silent-failure-hunter` |
| Comment accuracy / doc rot | `comment-analyzer` |
| Code complexity reduction | `code-simplifier` |
| Adversarial plan review | `plan-challenger` |
| Type design quality | `type-design-analyzer` |
| Test coverage gaps | `pr-test-analyzer` |
| Runtime errors / log analysis | `error-detective` |
| Pre-commit quality gate | `output-evaluator` |

### 5. Common Commands — Add Key Slash Commands

Add section for skill-based workflow commands that are frequently used:

```bash
# Key workflow skills (invoke as /command-name)
/ship                 # Pre-deployment readiness: tests, lint, build, CVE audit
/pr-risk              # Risk score before merge
/review-pr            # Review GitHub PR and post structured feedback
/iterate-pr           # Autonomous: fix CI failures and review feedback until green
/status-check         # Binary status: works / broken / not implemented
/validate-changes     # LLM-as-a-Judge review of staged diff before commit
/review-code          # Dispatch code-quality and security reviewer agents
/project-status       # Quick project health summary
```

## Files Modified

- `CLAUDE.md` — the only file changed

## Verification

After edit:
1. Read the updated CLAUDE.md to confirm no broken markdown tables
2. Verify services table has Kafka UI (8090) and Zipkin (9411)
3. Verify Code Review Agents table has `silent-failure-hunter`, `code-simplifier`, `plan-challenger`
4. Verify skills table reference to SKILLS_GUIDE.md is present
5. Verify slash commands block is in Common Commands section
