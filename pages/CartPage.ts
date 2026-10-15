import { expect, type Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  async expectProduct(productName: string): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Your Cart');
    const escapedName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const product = this.page.getByTestId('inventory-item-name').filter({
      hasText: new RegExp(`^${escapedName}$`),
    });
    await expect(product).toHaveCount(1);
    await expect(product).toBeVisible();
  }

  async checkout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }
}
