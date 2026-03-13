#!/bin/bash
# post-tool-failure.sh
# Fires on: PostToolUseFailure (after any tool call fails)
# Logs the tool name and error to stderr for visibility.

set -uo pipefail

# Claude Code passes failure context via stdin as JSON
INPUT=$(cat 2>/dev/null || true)

TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name','unknown'))" 2>/dev/null || echo "unknown")
ERROR_MSG=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error','(no detail)'))" 2>/dev/null || echo "(no detail)")

echo "🔴 Tool failure: [$TOOL_NAME] — $ERROR_MSG" >&2

exit 0
