#!/bin/bash
# Resets Demo 4 to its starting state so it can be run again.
# Run this between rehearsals or after the live session.
#
# Resets:
#   1. Restores qa-reviewer-with-comments agent from reference copy
#   2. Dismisses any existing PR review on PR #1 (so the live post looks fresh)

set -e

AGENT=".claude/agents/qa-reviewer-with-comments.md"
REFERENCE="demo/reference/qa-reviewer-with-comments.md"

echo "Resetting Demo 4..."

# Step 1 — Restore agent from reference copy
cp "$REFERENCE" "$AGENT"
echo "✅ qa-reviewer-with-comments agent restored"

# Step 2 — Remind trainer to dismiss the existing PR review manually
echo ""
echo "⚠️  Manual step required:"
echo "   Go to https://github.com/ketanvj/AIInTestingTrainingMaterial/pull/1"
echo "   Find the existing REQUEST_CHANGES review and dismiss it"
echo "   (GitHub does not allow deleting reviews via API)"
echo ""
echo "Demo 4 is ready to run again."
