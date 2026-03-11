---
name: ai-chat
description: AI chat interface patterns for Angular 21.x. Use when building streaming chat UI, conversational AI assistants, copilots, token context indicators, feedback loops, multi-modal inputs, tool visualization, or AI-specific error handling. Covers streaming markdown, auto-scroll heuristics, memoized rendering, token limit UI, regeneration controls, thumbs up/down feedback, and AI error states.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, mcp__context7__resolve-library-id, mcp__context7__query-docs
metadata:
  triggers: AI chat, streaming chat, conversational UI, chat interface, streaming response, token limit, AI assistant, copilot, chatbot, LLM UI, streaming markdown
  related-skills: angular-spa, agentic-ai-dev
  domain: frontend
  role: specialist
  scope: implementation
  output-format: code
---

# AI Chat Interface Skill

> **Tech Stack**: Angular 21.x (signals, daisyUI, TailwindCSS)

## When to Activate

Load this skill when the task involves any of:
- Streaming LLM response rendering (SSE / chunked HTTP)
- Chat message list with assistant/user bubbles
- Token context window indicators
- Regenerate / stop generation controls
- Thumbs up/down feedback collection
- Multi-modal input (file/image attachment in a chat box)
- AI-specific error states (refusal, rate limit, context exceeded)
- Tool call visualization in the message thread

## Pre-Code Checklist

Before writing any component:

1. **Angular**: Read `angular-spa` skill — verify signal/OnPush/daisyUI baseline
2. **Docs**: Use `Context7` MCP for any library not confirmed in this session (e.g., `marked`)

## Core Component Overview

| Component | Angular |
|-----------|---------|
| Message bubble list | `ChatMessageListComponent` |
| Streaming message display | `StreamingMessageComponent` |
| Token context indicator | `TokenIndicatorComponent` |
| Chat input (multi-modal) | `ChatInputComponent` |
| Feedback bar | `FeedbackComponent` |
| AI error display | `AiErrorComponent` |
| Tool call visualization | `ToolCallCardComponent` |

## Quick Start

See `reference/quick-start.md` for entry-point wiring (Angular `ChatComponent`).

## Key Patterns (brief — details in reference files)

### Streaming (Angular)
- Use `AbortController` to cancel in-flight SSE streams
- Auto-scroll: scroll only when user is within 100px of bottom
- `computed()` signal to derive rendered markdown — prevents re-parsing on every chunk
- `aria-live="polite"` wraps the message list

### Token Context
- `TokenIndicatorComponent` uses daisyUI `progress` + `text-warning`/`text-error` classes at 80%/100% thresholds
- Always display "~N messages remaining" not raw token numbers

### AI Errors
- Every AI error type has a distinct UI state — see `reference/ai-error-handling.md`
- NEVER swallow AI errors silently — always show user-visible feedback with an action

### Feedback
- `signal<'up'|'down'|null>` tracks selected thumb; regenerate re-emits prompt

### Multi-Modal Input
- Angular CDK drag-drop for file zone; `Enter` sends, `Shift+Enter` newlines

## Reference Files

| File | Contents |
|------|----------|
| `reference/quick-start.md` | Entry-point wiring for Angular ChatComponent |
| `reference/streaming-patterns.md` | Streaming UX, auto-scroll, memoization, stop controls |
| `reference/context-management.md` | Token indicator, threshold logic, summarization trigger |
| `reference/ai-error-handling.md` | Refusal, rate limit, context exceeded, timeout, hallucination flag |
| `reference/feedback-loops.md` | Thumbs up/down, copy, regenerate — Angular |
| `reference/multimodal-input.md` | File attach, preview chips, auto-expand textarea |

## Anti-Patterns — Hard Prohibitions

- **NEVER** re-parse markdown on every streaming chunk — memoize with `computed()` / derived state
- **NEVER** auto-scroll unconditionally — it steals user scroll position mid-read
- **NEVER** display raw token counts to end users — use human-readable approximations
- **NEVER** silently ignore AI error responses — every error must log + show user feedback
- **NEVER** hardcode colors for error/warning states — use daisyUI tokens
- **NEVER** use constructor DI in Angular — use `inject()`
- **NEVER** use `@Input()`/`@Output()` decorators — use `input()`, `output()`, `model()` signals

## Post-Code Review

After implementation, dispatch these reviewer agents:

| Concern | Agent |
|---------|-------|
| Angular code quality | `code-reviewer` |
| Accessibility (ARIA, keyboard nav) | `accessibility-auditor` |
| Security (file uploads, content rendering) | `security-reviewer` |
| UI/UX consistency | `ui-standards-expert` |
