import { defineConfig } from '@playwright/test';
import { environment, validateBrowser } from './config/environment';

/** Shared settings consumed by Playwright Test and the Cucumber browser hooks. */
export const browserSettings = {
  baseURL: environment.baseUrl,
  browserName: validateBrowser(),
  headless: environment.headless,
  stepTimeout: environment.stepTimeout,
  actionTimeout: environment.actionTimeout,
  navigationTimeout: environment.navigationTimeout,
  assertionTimeout: environment.assertionTimeout,
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
  screenshotDir: environment.screenshotDir,
  traceDir: environment.traceDir,
  slowMo: environment.slowMo,
};

export default defineConfig({
  testDir: './tests',
  timeout: browserSettings.stepTimeout,
  expect: { timeout: browserSettings.assertionTimeout },
  use: {
    baseURL: browserSettings.baseURL,
    browserName: browserSettings.browserName,
    headless: browserSettings.headless,
    actionTimeout: browserSettings.actionTimeout,
    navigationTimeout: browserSettings.navigationTimeout,
    testIdAttribute: 'data-test',
    screenshot: browserSettings.screenshot,
    trace: browserSettings.trace,
    launchOptions: { slowMo: browserSettings.slowMo },
  },
  outputDir: './test-results',
});
