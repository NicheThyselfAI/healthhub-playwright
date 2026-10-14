#!/bin/bash
# Resets Demo 2 to its clean starting state so it can be run again.
# Run this between rehearsals or after the live session.
#
# What it resets:
#   - Deletes the generated spec file (book-appointment.spec.js)
#   - Closes the open PR on GitHub (if exists)
#   - Deletes and recreates the demo/figma-to-pr branch
#
# What it does NOT reset (reusable across all runs):
#   - Figma design: https://www.figma.com/design/GUS55E4ZMWLfukl23Nw0u5
#   - Jira ticket: SCRUM-19

set -e

BRANCH="demo/figma-to-pr"
SPEC="tests/framework/tests/appointments/book-appointment.spec.js"
REPO="ketanvj/AIInTestingTrainingMaterial"

echo "Resetting Demo 2..."

# 1. Close open PR if one exists
echo "→ Checking for open PRs on $BRANCH..."
PR_NUMBER=$(gh pr list --repo "$REPO" --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || echo "")
if [ -n "$PR_NUMBER" ]; then
  gh pr close "$PR_NUMBER" --repo "$REPO" --delete-branch 2>/dev/null || true
  echo "  ✅ PR #$PR_NUMBER closed"
else
  echo "  ℹ️  No open PR found"
fi

# 2. Switch to main and pull latest
git checkout main
git pull origin main --quiet

# 3. Delete local branch if it exists
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git branch -D "$BRANCH"
  echo "  ✅ Local branch $BRANCH deleted"
fi

# 4. Delete remote branch if it exists
if git ls-remote --exit-code --heads origin "$BRANCH" &>/dev/null; then
  git push origin --delete "$BRANCH" --quiet
  echo "  ✅ Remote branch $BRANCH deleted"
fi

# 5. Recreate clean branch
git checkout -b "$BRANCH"
echo "  ✅ Fresh branch $BRANCH created"

echo ""
echo "Demo 2 is ready."
echo ""
echo "Starting state:"
echo "  Figma:  https://www.figma.com/design/GUS55E4ZMWLfukl23Nw0u5"
echo "  Jira:   https://nichethyself.atlassian.net/browse/SCRUM-19"
echo "  Branch: $BRANCH (clean, no spec file)"
