import type { Page } from '@playwright/test';
import { expect } from '../support/assertions';

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async enterCustomerDetails(details: CustomerDetails): Promise<void> {
    await this.page.getByTestId('firstName').fill(details.firstName);
    await this.page.getByTestId('lastName').fill(details.lastName);
    await this.page.getByTestId('postalCode').fill(details.postalCode);
    await this.page.getByTestId('continue').click();
  }

  async finishOrder(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Overview');
    await this.page.getByTestId('finish').click();
  }

  async expectOrderComplete(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Complete!');
    await expect(this.page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  }
}
