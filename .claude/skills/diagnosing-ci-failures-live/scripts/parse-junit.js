#!/usr/bin/env node
// ============================================================================
// parse-junit.js  <path-to-junit.xml>
//
// Parses a Playwright junit.xml and outputs structured failure JSON to stdout.
// Summary (total failures, suite count) goes to stderr.
//
// Usage:
//   node .claude/skills/diagnosing-ci-failures-live/scripts/parse-junit.js \
//     /tmp/ci-results-latest/junit.xml
//
// Output: JSON to stdout — { totalFailures, byCategory, summary }
// ============================================================================

import { readFileSync } from 'fs';
import { resolve } from 'path';

const xmlPath = process.argv[2];
if (!xmlPath) {
  console.error('Usage: node parse-junit.js <path-to-junit.xml>');
  process.exit(1);
}

let xml;
try {
  xml = readFileSync(resolve(xmlPath), 'utf-8');
} catch {
  console.error(`Error: cannot read file: ${xmlPath}`);
  process.exit(1);
}

function attr(str, name) {
  const m = str.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : '';
}

function stripCdata(str) {
  return str.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

function categorise(message, detail) {
  const text = (message + ' ' + detail).toLowerCase();
  if (/snapshot|screenshot|pixel diff|maxdiffpixel/i.test(text)) return 'visual-regression';
  if (/api|fetch|404|500|401|403|request failed/i.test(text))    return 'api-failure';
  if (/no such table|seed|database|sqlite|db_path/i.test(text))  return 'infrastructure';
  if (/locator|element|not visible|timeout|strict mode/i.test(text)) return 'selector-failure';
  return 'product-defect';
}

const failures = [];
const suitePattern = /<testsuite([^>]*)>([\s\S]*?)<\/testsuite>/g;
let suiteMatch;
while ((suiteMatch = suitePattern.exec(xml)) !== null) {
  const [, suiteAttrs, suiteBody] = suiteMatch;
  const suiteName = attr(suiteAttrs, 'name');
  const casePattern = /<testcase([^>]*)>([\s\S]*?)<\/testcase>/g;
  let caseMatch;
  while ((caseMatch = casePattern.exec(suiteBody)) !== null) {
    const [, caseAttrs, caseBody] = caseMatch;
    const failureMatch = caseBody.match(/<failure[^>]*message="([^"]*)"[^>]*>([\s\S]*?)<\/failure>/);
    if (!failureMatch) continue;
    const message = failureMatch[1];
    const detail  = stripCdata(failureMatch[2]).slice(0, 600);
    failures.push({
      suite:    suiteName,
      test:     attr(caseAttrs, 'name'),
      duration: parseFloat(attr(caseAttrs, 'time') || '0'),
      category: categorise(message, detail),
      message,
      detail,
    });
  }
}

const CATEGORY_ORDER = ['infrastructure','visual-regression','api-failure','selector-failure','product-defect'];
const byCategory = {};
for (const f of failures) {
  if (!byCategory[f.category]) byCategory[f.category] = [];
  byCategory[f.category].push(f);
}

const suiteSet = new Set(failures.map(f => f.suite));
const summary = {
  totalFailures: failures.length,
  totalSuites:   suiteSet.size,
  categories: Object.fromEntries(
    CATEGORY_ORDER.filter(c => byCategory[c]).map(c => [c, byCategory[c].length])
  ),
};

console.error(
  `Parsed: ${summary.totalFailures} failure(s) across ${summary.totalSuites} suite(s)` +
  (Object.keys(summary.categories).length
    ? ' — ' + Object.entries(summary.categories).map(([c, n]) => `${n} ${c}`).join(', ')
    : '')
);
console.log(JSON.stringify({ summary, byCategory }, null, 2));
