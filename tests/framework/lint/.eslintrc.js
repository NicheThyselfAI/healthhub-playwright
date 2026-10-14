// ============================================================================
// ESLint Configuration for Playwright Tests
// ============================================================================
//
// ESLint is a static analysis tool that catches bugs and enforces code style
// BEFORE you run the tests. Think of it as a spell-checker for JavaScript.
//
// How to run:
//   npx eslint --config framework/lint/.eslintrc.js framework/
//
// Severity levels used in this file:
//   'error'  → blocks CI; must be fixed before merging
//   'warn'   → flags a problem but does not block CI; fix when practical
//   'off'    → rule is disabled
//
// Note: This uses ESLint's "flat config" format (introduced in v9, default
// in v10). The old format used `env`, `parserOptions` as top-level keys.
// Flat config uses `languageOptions` instead — see migration guide:
// https://eslint.org/docs/latest/use/configure/migration-guide
//
// ============================================================================

import globals from 'globals';

export default [
  {
    // ── Language options ──────────────────────────────────────────────────────
    // Replaces the old `env` + `parserOptions` keys in the flat config format.
    languageOptions: {
      // ecmaVersion: which JS syntax to parse (optional chaining, class fields…)
      // sourceType: 'module' means files use import/export (not require)
      // 'latest' ensures ESLint can parse cutting-edge syntax like
      // Import Attributes: import x from './f.json' with { type: 'json' }
      ecmaVersion: 'latest',
      sourceType: 'module',

      // globals: which built-in variables are available in this environment.
      // `globals.node` provides process, __dirname, Buffer, etc.
      // `globals.es2022` provides Promise, Map, structuredClone, etc.
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },

    // ── Rules ────────────────────────────────────────────────────────────────
    // Each rule targets a specific pattern. Rules are grouped by concern below.
    rules: {

    // ── Correctness: catching real bugs ──────────────────────────────────────

    // Warn when a variable is declared with `let` but never reassigned.
    // Example that triggers this:
    //   let page = await context.newPage();   // ← should be `const`
    // Why it matters: `let` signals intent to reassign. Using it when you
    // don't reassign is misleading to the next reader.
    'prefer-const': 'warn',

    // Warn when a variable is declared but never used.
    // The { argsIgnorePattern: '^_' } exception lets you prefix unused
    // function parameters with _ to silence the warning, e.g.:
    //   async function handler(_req, res) { ... }
    // Why it matters: leftover variables are a sign of incomplete refactoring
    // and can mask copy-paste errors.
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Warn when an async function contains no `await` expression.
    // Example that triggers this:
    //   async function getTitle() { return 'hello'; }  // ← no await needed
    // Why it matters: an async function without await returns a Promise
    // wrapping a plain value — almost always unintentional in test code.
    'require-await': 'warn',

    // Error when the same case label appears twice in a switch statement.
    // Also flags duplicate test.describe / test titles in some lint plugins.
    // Why it matters: duplicate cases silently fall through to the first match,
    // hiding the second branch entirely.
    'no-duplicate-case': 'error',

    // ── Logging discipline ────────────────────────────────────────────────────

    // Warn on console.log() calls; allow console.warn() and console.error().
    // Why it matters: this framework has a structured `logger` utility
    // (framework/utils/logger.js) that writes to Allure reports and CI logs.
    // Raw console.log() statements bypass that pipeline and clutter output.
    // Use: logger.info() / logger.debug() / logger.warn() instead.
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // ── Code style: enforced for consistency across all contributors ──────────
    // Style rules produce warnings rather than errors so that a forgotten
    // semicolon doesn't block a CI run, but they are still flagged for review.

    // Require semicolons at end of statements.
    //   BAD:  const x = 1
    //   GOOD: const x = 1;
    'semi': ['warn', 'always'],

    // Require single quotes for strings; allow double quotes only to avoid
    // escaping (e.g., "it's fine" instead of 'it\'s fine').
    //   BAD:  const msg = "hello"
    //   GOOD: const msg = 'hello'
    //   OK:   const msg = "it's a test"
    'quotes': ['warn', 'single', { avoidEscape: true }],

    // Disallow trailing whitespace at the end of lines.
    // Why it matters: invisible whitespace creates noisy diffs in code review.
    'no-trailing-spaces': 'warn',

    // Require a newline at the end of every file.
    // Why it matters: POSIX standard; many tools (git diff, cat) behave oddly
    // without it. Most editors add this automatically.
    'eol-last': ['warn', 'always'],

    // Require a trailing comma after the last item in multi-line
    // arrays, objects, function parameters, and imports.
    //   BAD:
    //     const obj = {
    //       a: 1,
    //       b: 2   ← missing trailing comma
    //     };
    //   GOOD:
    //     const obj = {
    //       a: 1,
    //       b: 2,  ← trailing comma present
    //     };
    // Why it matters: makes git diffs cleaner — adding a new last item only
    // shows one changed line instead of two.
    'comma-dangle': ['warn', 'always-multiline'],
    },
  },
];
