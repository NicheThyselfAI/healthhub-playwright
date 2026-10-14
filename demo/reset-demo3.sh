#!/bin/bash
# Resets Demo 3 to its starting state so it can be run again.
# Run this between rehearsals or after the live session.
#
# Resets:
#   1. Restores qa-reviewer agent from reference copy
#   2. Restores appointment-cancellation.spec.js to its broken state

set -e

AGENT=".claude/agents/qa-reviewer.md"
REFERENCE="demo/reference/qa-reviewer.md"
SPEC="demo/specs/appointment-cancellation.spec.js"

echo "Resetting Demo 3..."

# Step 1 — Restore qa-reviewer agent from reference copy
cp "$REFERENCE" "$AGENT"
echo "✅ qa-reviewer agent restored from $REFERENCE"

# Step 2 — Restore appointment-cancellation.spec.js to broken state
cat > "$SPEC" << 'SPEC_EOF'
// Appointment cancellation tests
import { test, expect } from '@playwright/test';

test.describe('Appointment Cancellation', () => {

  test('cancel appointment', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.getByLabel('Email').fill('patient@healthhub.test');
    await page.getByLabel('Password').fill('Test123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for dashboard
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'Appointments' }).click();

    // Wait for list to load
    await page.waitForTimeout(1500);

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.getByRole('button', { name: 'Edit appointment' }).click();

    // Wait for modal
    await page.waitForTimeout(1000);

    await page.locator('[data-testid="appointment-status-cancelled"]').check();

    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Update Appointment' }).click();

    // Wait for save
    await page.waitForTimeout(2000);

    const response = await page.request.get('http://localhost:3001/api/appointments');
    expect(response.status()).toBe(200);
  });

  test('check cancelled status', async ({ page }) => {
    await page.goto('http://localhost:5173/appointments');

    await page.waitForTimeout(2000);

    const row = page.locator('table tbody tr').first();
    await expect(row).toContainText('Cancelled');
  });

});
SPEC_EOF

echo "✅ appointment-cancellation.spec.js restored to broken state"
echo "Demo 3 is ready to run again."
