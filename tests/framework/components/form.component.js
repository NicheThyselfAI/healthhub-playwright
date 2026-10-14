// ============================================================================
// Form Component — Generic Form Helpers
// ============================================================================
//
// Reusable component for form interactions.
// Uses getByRole and getByLabel exclusively — these work because the app's
// shared Input/Select/Checkbox/Radio components properly wire <label>
// to <input> via htmlFor/id.
//
// LOCATOR STRATEGY:
//   - getByRole('textbox', { name })   — text inputs with labels
//   - getByRole('combobox', { name })  — select dropdowns with labels
//   - getByRole('checkbox', { name })  — checkboxes
//   - getByRole('radio', { name })     — radio buttons
//   - getByRole('button', { name })    — buttons
//   - getByLabel()                     — date/time inputs (type=date/time)
//   - getByPlaceholder()              — textareas without proper label wiring
//
// ============================================================================

import { test } from '@playwright/test';

export class FormComponent {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').Locator} container — Form container locator
   */
  constructor(page, container) {
    this.page = page;
    this.container = container;
  }

  /**
   * Fill a text input by its label.
   * Works with inputs that have properly associated <label> elements.
   * @param {string} label — Label text (e.g., 'Title', 'Provider')
   * @param {string} value — Value to fill
   */
  async fill(label, value) {
    await test.step(`Fill "${label}": ${value}`, async () => {
      await this.container.getByLabel(label).fill(value);
    });
  }

  /**
   * Select an option from a labeled select/combobox.
   * @param {string} label — Label text (e.g., 'Type', 'Duration')
   * @param {string} value — Option value
   */
  async select(label, value) {
    await test.step(`Select "${label}": ${value}`, async () => {
      await this.container.getByLabel(label).selectOption(value);
    });
  }

  /**
   * Fill a textarea by its placeholder text.
   * Used for textareas that lack proper label association in the app.
   * @param {string} placeholder — Placeholder text
   * @param {string} value — Text to fill
   */
  async fillByPlaceholder(placeholder, value) {
    await test.step(`Fill "${placeholder}": ${value}`, async () => {
      await this.container.getByPlaceholder(placeholder).fill(value);
    });
  }

  /**
   * Check or uncheck a checkbox by its label.
   * @param {string} label — Label text (e.g., 'Remember me')
   * @param {boolean} [checked=true]
   */
  async check(label, checked = true) {
    await test.step(`${checked ? 'Check' : 'Uncheck'} "${label}"`, async () => {
      const checkbox = this.container.getByRole('checkbox', { name: label });
      if (checked) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    });
  }

  /**
   * Select a radio option by its label.
   * @param {string} label — Radio label text (e.g., 'Scheduled', 'Completed')
   */
  async selectRadio(label) {
    await test.step(`Select radio: "${label}"`, async () => {
      await this.container.getByRole('radio', { name: label }).check();
    });
  }

  /**
   * Click a button within the form by its text.
   * @param {string} name — Button text (e.g., 'Create Appointment', 'Cancel')
   */
  async clickButton(name) {
    await test.step(`Click button: "${name}"`, async () => {
      await this.container.getByRole('button', { name }).click();
    });
  }

  /**
   * Get all validation error messages from the form.
   * @returns {Promise<string[]>} Array of error messages
   */
  async getValidationErrors() {
    const errors = this.container.getByRole('alert');
    const count = await errors.count();
    const messages = [];
    for (let i = 0; i < count; i++) {
      messages.push(await errors.nth(i).textContent());
    }
    return messages;
  }
}
