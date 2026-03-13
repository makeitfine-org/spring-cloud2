#!/bin/bash
# session-end.sh
# Fires on: SessionEnd (session termination)
# Reminds about uncommitted changes before session closes.

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Check for uncommitted changes
if git -C "$PROJECT_DIR" diff --quiet 2>/dev/null && git -C "$PROJECT_DIR" diff --cached --quiet 2>/dev/null; then
  # No uncommitted changes — nothing to warn about
  exit 0
fi

UNSTAGED=$(git -C "$PROJECT_DIR" diff --stat 2>/dev/null | tail -1)
STAGED=$(git -C "$PROJECT_DIR" diff --cached --stat 2>/dev/null | tail -1)

{
  echo "⚠️  Session ending with uncommitted changes:"
  [ -n "$STAGED" ]   && echo "   Staged:   $STAGED"
  [ -n "$UNSTAGED" ] && echo "   Unstaged: $UNSTAGED"
  echo "   Run: git stash  or  git commit before closing."
} >&2

exit 0
