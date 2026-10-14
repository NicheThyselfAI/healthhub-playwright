---
name: writing-page-objects
description: Create Page Object Model classes for the HealthHub framework. Use when adding a new page, extracting UI interactions from a test into a POM, or when asked to create a page object. TRIGGER on "create a page object", "add a POM for X", "extract page interactions", "make a page class".
---

# Writing Page Objects

## Rules

1. Extend `BasePage` — every POM must implement `waitForPageReady()`
2. **No assertions** inside page objects — tests own `expect()`
3. Use **composition** for shared UI fragments (TableComponent, ModalComponent, etc.)
4. Navigate via `navigateViaSidebar()` — avoid `page.goto()` in page objects
5. File goes in `tests/framework/pages/<name>.page.js`

## Template

```js
// tests/framework/pages/<feature>.page.js
import { BasePage } from './base.page.js';
import { TableComponent } from '../components/table.component.js';
import { ModalComponent } from '../components/modal.component.js';

export class FeaturePage extends BasePage {
  constructor(page) {
    super(page);                            // gives this.page, this.toast
    this.table = new TableComponent(page);  // compose shared components
    this.modal = new ModalComponent(page);
  }

  // Required by BasePage contract
  async waitForPageReady() {
    await this.page.getByRole('heading', { name: 'Feature Title' }).waitFor();
  }

  async navigateViaSidebar() {
    await this.page.getByRole('link', { name: 'Feature' }).click();
    await this.waitForPageReady();
  }

  async openCreateModal() {
    await this.page.getByRole('button', { name: 'New Item' }).click();
    await this.modal.waitForOpen();
  }

  async createItem(data) {
    await this.openCreateModal();
    await this.page.getByLabel('Title').fill(data.title);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.modal.waitForClose();
  }

  async deleteItem(title) {
    await this.table.getRowByText(title)
      .getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
```

## Available components to compose

| Component | Import | Provides |
|-----------|--------|---------|
| `TableComponent` | `../components/table.component.js` | `sortBy()`, `getRowByText()`, `getCell()` |
| `ModalComponent` | `../components/modal.component.js` | `waitForOpen()`, `waitForClose()` |
| `FormComponent` | `../components/form.component.js` | `fill()`, `submit()` |
| `ToastComponent` | `../components/toast.component.js` | `waitForSuccess()`, `waitForError()` |
| `SidebarComponent` | `../components/sidebar.component.js` | `navigateTo()` |

## Full example

See [references/template.md](references/template.md)
