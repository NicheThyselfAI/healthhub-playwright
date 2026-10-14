#!/bin/bash
# Resets Demo 1 to its broken state so it can be run again.
# Run this between rehearsals or after the live session.

set -e

SPEC="demo/specs/status.spec.js"

echo "Resetting Demo 1..."

sed -i '' "s/await expect(row).toContainText('Scheduled')/await expect(row).toContainText('Confirmed')/" "$SPEC"

if grep -q "toContainText('Confirmed')" "$SPEC"; then
  echo "✅ status.spec.js reset — assertion is back to 'Confirmed'"
else
  echo "❌ Reset failed — check $SPEC manually"
  exit 1
fi

echo "Demo 1 is ready to run again."
