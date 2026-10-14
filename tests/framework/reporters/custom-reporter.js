// ============================================================================
// Custom Playwright Reporter
// ============================================================================
//
// A custom reporter that provides:
//   - Real-time console output with test status
//   - Summary with pass/fail counts, duration, and slowest tests
//   - Failed test details with error messages
//
// Usage in playwright.config.js:
//   reporter: [
//     ['./reporters/custom-reporter.js', { slowThreshold: 5000 }],
//     ['html'],
//   ],
//
// ============================================================================

class CustomReporter {
  constructor(options = {}) {
    this.slowThreshold = options.slowThreshold || 5000;
    this.results = [];
    this.startTime = null;
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    const totalTests = suite.allTests().length;
    console.log(`\n========================================`);
    console.log(`  HealthHub Framework Test Run`);
    console.log(`  Tests: ${totalTests} | Workers: ${config.workers}`);
    console.log(`  Started: ${new Date().toLocaleTimeString()}`);
    console.log(`========================================\n`);
  }

  onTestEnd(test, result) {
    const duration = result.duration;
    const status = result.status;
    const isSlow = duration > this.slowThreshold;

    const icon = {
      passed: '\u2705',    // green checkmark
      failed: '\u274C',    // red X
      skipped: '\u23ED',   // skip
      timedOut: '\u23F0',  // clock
    }[status] || '\u2753';  // question mark

    const slowTag = isSlow ? ` [SLOW: ${(duration / 1000).toFixed(1)}s]` : '';
    const durationStr = `(${duration}ms)`;

    console.log(`  ${icon} ${test.title} ${durationStr}${slowTag}`);

    this.results.push({
      title: test.title,
      file: test.location.file,
      status,
      duration,
      error: result.error?.message || null,
    });
  }

  onEnd(result) {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const timedOut = this.results.filter(r => r.status === 'timedOut').length;

    console.log(`\n========================================`);
    console.log(`  Test Run Summary`);
    console.log(`========================================`);
    console.log(`  Total:    ${this.results.length}`);
    console.log(`  Passed:   ${passed}`);
    if (failed)   console.log(`  Failed:   ${failed}`);
    if (skipped)  console.log(`  Skipped:  ${skipped}`);
    if (timedOut) console.log(`  Timed Out: ${timedOut}`);
    console.log(`  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`  Status:   ${result.status.toUpperCase()}`);

    // Show slow tests
    const slowTests = this.results
      .filter(r => r.duration > this.slowThreshold)
      .sort((a, b) => b.duration - a.duration);

    if (slowTests.length > 0) {
      console.log(`\n  Slow Tests (>${this.slowThreshold}ms):`);
      for (const t of slowTests.slice(0, 5)) {
        console.log(`    - ${t.title} (${t.duration}ms)`);
      }
    }

    // Show failed tests
    const failedTests = this.results.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      console.log(`\n  Failed Tests:`);
      for (const t of failedTests) {
        console.log(`    - ${t.title}`);
        if (t.error) {
          const shortError = t.error.split('\n')[0].substring(0, 100);
          console.log(`      Error: ${shortError}`);
        }
      }
    }

    console.log(`\n========================================\n`);
  }
}

export default CustomReporter;
