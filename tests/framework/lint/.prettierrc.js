// ============================================================================
// Prettier Configuration
// ============================================================================
//
// Prettier is an opinionated code *formatter*. Unlike ESLint (which catches
// bugs and enforces patterns), Prettier only cares about whitespace, line
// length, and punctuation — the purely cosmetic stuff.
//
// ESLint vs Prettier — a quick mental model:
//   ESLint   → "you used let when you should use const"  (logic / correctness)
//   Prettier → "this line is 120 chars, wrap it at 100"  (visual / style)
//
// How to run:
//   npx prettier --config framework/lint/.prettierrc.js --write framework/
//
// How to check without changing files (useful in CI):
//   npx prettier --config framework/lint/.prettierrc.js --check framework/
//
// ============================================================================

export default {
  // Require semicolons at the end of statements.
  // Matches the ESLint `semi` rule so both tools agree.
  //   BEFORE: const x = 1
  //   AFTER:  const x = 1;
  semi: true,

  // Use single quotes for strings instead of double quotes.
  // Matches the ESLint `quotes` rule.
  //   BEFORE: const msg = "hello"
  //   AFTER:  const msg = 'hello'
  singleQuote: true,

  // Add a trailing comma after the last item in multi-line structures
  // (arrays, objects, function parameters, imports).
  // "all" includes function parameters, which requires ES2017+ targets.
  //   BEFORE:
  //     import {
  //       foo,
  //       bar
  //     }
  //   AFTER:
  //     import {
  //       foo,
  //       bar,   ← trailing comma added
  //     }
  // Why it matters: smaller, cleaner git diffs when adding a new last item.
  trailingComma: 'all',

  // Wrap lines that exceed 100 characters.
  // 100 is a pragmatic middle ground: wider than the old 80-char terminal
  // standard but still readable on split-screen editors and code review diffs.
  printWidth: 100,

  // Use 2 spaces per indentation level.
  // Keeps code compact without sacrificing readability.
  tabWidth: 2,

  // Use spaces, not tab characters, for indentation.
  // Prevents the "tabs vs spaces" rendering inconsistency across editors.
  useTabs: false,

  // Add spaces between the braces of an inline object literal.
  //   BEFORE: {foo: 'bar'}
  //   AFTER:  { foo: 'bar' }
  bracketSpacing: true,

  // Always wrap arrow function parameters in parentheses, even when there
  // is only one parameter.
  //   BEFORE: x => x * 2
  //   AFTER:  (x) => x * 2
  // Why it matters: consistent shape; easier to add a second parameter later
  // without having to add parentheses at the same time.
  arrowParens: 'always',

  // Enforce Unix-style line endings (\n) rather than Windows-style (\r\n).
  // Prevents invisible whitespace differences between contributors on
  // different operating systems from showing up in git diffs.
  endOfLine: 'lf',
};
