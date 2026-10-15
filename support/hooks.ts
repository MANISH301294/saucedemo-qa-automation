import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit, selectors, type BrowserType } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { browserSettings } from '../playwright.config';
import { AutomationWorld } from './world';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const browserTypes: Record<string, BrowserType> = { chromium, firefox, webkit };
// SauceDemo uses data-test rather than Playwright's default data-testid attribute.
selectors.setTestIdAttribute('data-test');
setDefaultTimeout(browserSettings.timeout);

Before(async function (this: AutomationWorld, scenario) {
  console.info(`[${scenario.pickle.name}] Starting ${browserSettings.browserName} (headless=${browserSettings.headless})`);
  this.browser = await browserTypes[browserSettings.browserName].launch({ headless: browserSettings.headless, slowMo: browserSettings.slowMo });
  this.context = await this.browser.newContext({ baseURL: browserSettings.baseURL });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(browserSettings.actionTimeout);
  this.page.setDefaultNavigationTimeout(browserSettings.navigationTimeout);
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  this.loginPage = new LoginPage(this.page);
  this.inventoryPage = new InventoryPage(this.page);
  this.cartPage = new CartPage(this.page);
  this.checkoutPage = new CheckoutPage(this.page);
});

After(async function (this: AutomationWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const directory = resolve(browserSettings.screenshotDir);
    await mkdir(directory, { recursive: true });
    const filename = `${scenario.pickle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}.png`;
    const screenshot = await this.page.screenshot({ path: resolve(directory, filename), fullPage: true });
    this.attach(screenshot, 'image/png');
    console.error(`[${scenario.pickle.name}] Failed. Screenshot saved to ${resolve(directory, filename)}`);
  }
  if (this.context) {
    if (scenario.result?.status === Status.FAILED) {
      const directory = resolve(browserSettings.traceDir);
      await mkdir(directory, { recursive: true });
      const filename = `${scenario.pickle.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${Date.now()}.zip`;
      const tracePath = resolve(directory, filename);
      await this.context.tracing.stop({ path: tracePath });
      this.attach(await readFile(tracePath), 'application/zip');
      console.error(`[${scenario.pickle.name}] Trace saved to ${tracePath}`);
    } else {
      await this.context.tracing.stop();
    }
  }
  await this.context?.close();
  await this.browser?.close();
});
