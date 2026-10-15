import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

export class AutomationWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  loginPage?: LoginPage;
  inventoryPage?: InventoryPage;
  cartPage?: CartPage;
  checkoutPage?: CheckoutPage;
}

setWorldConstructor(AutomationWorld);
