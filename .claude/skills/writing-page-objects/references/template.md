# Page Object Full Reference

## AppointmentsPage — annotated real example

```js
import { BasePage } from './base.page.js';
import { TableComponent } from '../components/table.component.js';
import { ModalComponent } from '../components/modal.component.js';

export class AppointmentsPage extends BasePage {
  constructor(page) {
    super(page);
    this.table = new TableComponent(page);
    this.modal = new ModalComponent(page);
  }

  async waitForPageReady() {
    await this.page.getByRole('heading', { name: 'Appointments' }).waitFor();
  }

  async navigateViaSidebar() {
    await this.page.getByRole('link', { name: 'Appointments' }).click();
    await this.waitForPageReady();
  }

  async createAppointment(data) {
    await this.page.getByRole('button', { name: 'New Appointment' }).click();
    await this.modal.waitForOpen();

    await this.page.getByLabel('Title').fill(data.title);
    if (data.date) await this.page.getByLabel('Date').fill(data.date);
    if (data.time) await this.page.getByLabel('Time').fill(data.time);
    if (data.type) await this.page.getByLabel('Type').selectOption(data.type);
    if (data.duration) await this.page.getByLabel('Duration').fill(data.duration);

    await this.page.getByRole('button', { name: 'Create Appointment' }).click();
    await this.modal.waitForClose();
  }

  async deleteAppointment(title) {
    await this.table.getRowByText(title)
      .getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async editAppointment(title) {
    await this.table.getRowByText(title)
      .getByRole('button', { name: 'Edit' }).click();
    await this.modal.waitForOpen();
  }
}
```

## BasePage contract

```js
// base.page.js — what you inherit
class BasePage {
  constructor(page) {
    this.page = page;
    this.toast = new ToastComponent(page);  // always available
  }

  async waitForPageReady() { /* must override */ }
  async waitForLoadingComplete() { /* spinner check */ }
  async getCurrentPath() { /* returns pathname */ }
}
```

## Selector priority (best → avoid)

1. `getByRole()` — semantic, accessible
2. `getByLabel()` — form inputs
3. `getByText()` — visible text
4. `getByTestId()` — stable test hooks
5. CSS selectors — last resort, fragile
