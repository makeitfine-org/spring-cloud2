#!/bin/bash
# pre-compact.sh
# Fires on: PreCompact (before context compaction — manual /compact or auto)
# Warns that context is about to be compacted; prompts to save state if needed.

set -uo pipefail

echo "⚠️  Context compaction triggered. Active task state and recent decisions will be summarised." >&2
echo "   If you have unsaved plan decisions, note them before the next response." >&2

exit 0
