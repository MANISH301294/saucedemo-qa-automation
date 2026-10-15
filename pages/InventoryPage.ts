import { expect, type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  private get cartLink() { return this.page.getByTestId('shopping-cart-link'); }
  private get cartBadge() { return this.page.getByTestId('shopping-cart-badge'); }

  private productCard(productName: string): Locator {
    // SauceDemo exposes stable data-test selectors; the card scopes the action to this product.
    return this.page.getByTestId('inventory-item').filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByTestId('title')).toHaveText('Products');
  }

  async addToCart(productName: string): Promise<void> {
    const card = this.productCard(productName);
    await expect(card).toBeVisible();
    const productSlug = productName.toLowerCase().replaceAll(' ', '-');
    await card.getByTestId(`add-to-cart-${productSlug}`).click();
    await expect(this.cartBadge).toHaveText('1');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
