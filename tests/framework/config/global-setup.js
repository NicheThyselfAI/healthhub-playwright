// ============================================================================
// Allure Global Setup
// ============================================================================
//
// Runs once before all tests. Writes the three metadata files that Allure
// reads from allure-results/ when generating the report:
//
//   environment.properties  → Overview > Environment panel
//   executor.json           → Overview > Executors panel (CI only)
//   categories.json         → Overview > Categories panel
//
// History (for Trend) is handled separately by the CI workflow, which
// downloads the previous run's allure-report/history/ into allure-results/history/
// before calling `allure generate`.
//
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const allureResultsDir = path.resolve(__dirname, '..', 'allure-results');

export default async function globalSetup() {
  fs.mkdirSync(allureResultsDir, { recursive: true });

  // ── environment.properties ─────────────────────────────────────────────────
  // Key=Value format (no spaces around =). Shown on Overview > Environment.
  const envLines = [
    `App=HealthHub`,
    `Environment=${process.env.TEST_ENV || 'local'}`,
    // Discover selected browsers from any BROWSER_<NAME>=true env var.
    // To add a new browser, just add BROWSER_<NAME> to the workflow — no
    // changes needed here.
    `Browser=${Object.entries(process.env)
      .filter(([key, val]) => key.startsWith('BROWSER_') && val === 'true')
      .map(([key]) => key.replace('BROWSER_', '').toLowerCase())
      .join(', ') || 'chromium'}`,
    `Node.Version=${process.version}`,
    `Platform=${process.env.RUNNER_OS || process.platform}`,
    `Branch=${process.env.GITHUB_REF_NAME || 'local'}`,
    `Run.Number=${process.env.GITHUB_RUN_NUMBER || 'N/A'}`,
  ];
  fs.writeFileSync(
    path.join(allureResultsDir, 'environment.properties'),
    envLines.join('\n') + '\n'
  );

  // ── executor.json ─────────────────────────────────────────────────────────
  // Only written in CI (GITHUB_RUN_ID is set by GitHub Actions).
  // Shown on Overview > Executors panel.
  if (process.env.GITHUB_RUN_ID) {
    const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`;
    const runUrl = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    const executor = {
      name: 'GitHub Actions',
      type: 'github',
      url: runUrl,
      buildOrder: Number(process.env.GITHUB_RUN_NUMBER),
      buildName: `Run #${process.env.GITHUB_RUN_NUMBER}`,
      buildUrl: runUrl,
      reportName: 'Allure Report',
    };
    fs.writeFileSync(
      path.join(allureResultsDir, 'executor.json'),
      JSON.stringify(executor, null, 2)
    );
  }

  // ── categories.json ───────────────────────────────────────────────────────
  // Copied from config/ into allure-results/ so allure generate picks it up.
  fs.copyFileSync(
    path.join(__dirname, 'allure-categories.json'),
    path.join(allureResultsDir, 'categories.json')
  );
}
