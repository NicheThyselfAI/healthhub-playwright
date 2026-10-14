// ============================================================================
// Symptoms Checker Page — Page Object
// ============================================================================
//
// Multi-step wizard: Select Symptoms → Severity → Additional Info → Review → Results
//
// LOCATOR STRATEGY — getByRole first:
//   - getByRole('heading')          — page title, step headings
//   - getByRole('button')           — Next, Back, Submit, Book Appointment
//   - getByRole('checkbox', { name})— symptom checkboxes, additional info flags
//   - getByRole('radio', { name })  — severity radios (Mild, Moderate, Severe)
//   - getByRole('combobox', { name})— duration select
//   - getByPlaceholder()            — symptom search input
//   - getByTestId()                 — ONLY for step content containers and
//                                     results container (no accessible names)
//
// ============================================================================

import { test } from '@playwright/test';
import { BasePage } from './base.page.js';
import { SidebarComponent } from '../components/sidebar.component.js';

export class SymptomsPage extends BasePage {
  constructor(page) {
    super(page);

    // Composed components
    this.sidebar = new SidebarComponent(page);

    // Page-level elements
    this.pageHeading = page.getByRole('heading', { name: 'Symptom Checker' });

    // Navigation buttons
    this.nextBtn   = page.getByRole('button', { name: 'Next' });
    this.backBtn   = page.getByRole('button', { name: /back|previous/i });
    this.submitBtn = page.getByRole('button', { name: 'Get Results' });

    // Results elements
    this.resultsContainer  = page.getByTestId('symptom-results');
    this.bookAppointmentBtn = page.getByRole('button', { name: 'Book Appointment' });
  }

  async waitForPageReady() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async goto() {
    await test.step('Navigate to symptom checker', async () => {
      await this.page.goto('/symptoms');
      await this.waitForPageReady();
    });
  }

  /**
   * Navigate via sidebar (preserves auth state).
   */
  async navigateViaSidebar() {
    await this.sidebar.navigateTo('Symptom Checker');
    await this.waitForPageReady();
  }

  // ── Step 1: Symptom Selection ────────────────────────────────────

  /**
   * Search for a symptom by name.
   * @param {string} query
   */
  async searchSymptom(query) {
    await test.step(`Search symptom: ${query}`, async () => {
      await this.page.getByPlaceholder('Search symptoms...').fill(query);
    });
  }

  /**
   * Select a symptom checkbox by its label name.
   * @param {string} symptomName — e.g., 'Headache', 'Chest Pain'
   */
  async selectSymptom(symptomName) {
    await test.step(`Select symptom: ${symptomName}`, async () => {
      await this.page.getByRole('checkbox', { name: symptomName }).check();
    });
  }

  /**
   * Select multiple symptoms.
   * @param {string[]} symptoms — Array of symptom names
   */
  async selectSymptoms(symptoms) {
    await test.step(`Select symptoms: ${symptoms.join(', ')}`, async () => {
      for (const symptom of symptoms) {
        await this.page.getByRole('checkbox', { name: symptom }).check();
      }
    });
  }

  // ── Step 2: Severity & Duration ──────────────────────────────────

  /**
   * Select severity level.
   * @param {'Mild'|'Moderate'|'Severe'} level
   */
  async selectSeverity(level) {
    await test.step(`Select severity: ${level}`, async () => {
      await this.page.getByRole('radio', { name: level }).check();
    });
  }

  /**
   * Select duration from dropdown.
   * @param {string} duration — e.g., 'today', '1_day', '2_3_days', '4_7_days'
   */
  async selectDuration(duration) {
    await test.step(`Select duration: ${duration}`, async () => {
      await this.page.getByTestId('symptom-duration').selectOption(duration);
    });
  }

  // ── Step 3: Additional Information ───────────────────────────────

  /**
   * Set additional info flags.
   * @param {object} [info]
   * @param {boolean} [info.fever]
   * @param {boolean} [info.recentTravel]
   * @param {boolean} [info.newMedications]
   */
  async setAdditionalInfo(info = {}) {
    await test.step('Set additional information', async () => {
      if (info.fever) {
        await this.page.getByRole('checkbox', { name: /fever/i }).check();
      }
      if (info.recentTravel) {
        await this.page.getByRole('checkbox', { name: /traveled/i }).check();
      }
      if (info.newMedications) {
        await this.page.getByRole('checkbox', { name: /new medications/i }).check();
      }
    });
  }

  // ── Navigation ───────────────────────────────────────────────────

  /**
   * Go to next step.
   */
  async goNext() {
    await test.step('Go to next step', async () => {
      await this.nextBtn.click();
    });
  }

  /**
   * Go to previous step.
   */
  async goBack() {
    await test.step('Go to previous step', async () => {
      await this.backBtn.click();
    });
  }

  /**
   * Submit the symptom check (from review step).
   */
  async submitCheck() {
    await test.step('Submit symptom check', async () => {
      const responsePromise = this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api') &&
          resp.url().includes('/symptoms/check') &&
          resp.request().method() === 'POST',
      );
      await this.submitBtn.click();
      await responsePromise;
    });
  }

  /**
   * Run through the entire symptom check wizard.
   * @param {object} data
   * @param {string[]} data.symptoms — Symptom names to select
   * @param {'Mild'|'Moderate'|'Severe'} data.severity
   * @param {string} data.duration — Duration value
   * @param {object} [data.additionalInfo] — Additional flags
   */
  async completeCheck(data) {
    await test.step('Complete symptom check wizard', async () => {
      // Step 1: Select symptoms
      await this.selectSymptoms(data.symptoms);
      await this.goNext();

      // Step 2: Severity & Duration
      await this.selectSeverity(data.severity);
      await this.selectDuration(data.duration);
      await this.goNext();

      // Step 3: Additional info
      if (data.additionalInfo) {
        await this.setAdditionalInfo(data.additionalInfo);
      }
      await this.goNext();

      // Step 4: Review → Submit
      await this.submitCheck();
    });
  }
}
