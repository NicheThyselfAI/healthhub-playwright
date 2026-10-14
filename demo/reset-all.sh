#!/bin/bash
# Resets ALL demos to their starting state.
# Run this before a full rehearsal or at the start of a new training session.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================"
echo "  Resetting all demos..."
echo "========================================"

bash "$SCRIPT_DIR/reset-demo1.sh"
echo ""
bash "$SCRIPT_DIR/reset-demo3.sh"
echo ""
bash "$SCRIPT_DIR/reset-demo4.sh"

echo ""
echo "========================================"
echo "  All demos reset. Ready to go. ✅"
echo "========================================"
