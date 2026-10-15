import { defineConfig } from '@playwright/test';
import { environment, validateBrowser } from './config/environment';

/** Shared settings consumed by Playwright Test and the Cucumber browser hooks. */
export const browserSettings = {
  baseURL: environment.baseUrl,
  browserName: validateBrowser(),
  headless: environment.headless,
  timeout: environment.defaultTimeout,
  actionTimeout: environment.defaultTimeout,
  navigationTimeout: environment.defaultTimeout,
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
  screenshotDir: environment.screenshotDir,
  traceDir: environment.traceDir,
  slowMo: environment.slowMo,
};

export default defineConfig({
  testDir: './tests',
  timeout: browserSettings.timeout,
  expect: { timeout: browserSettings.timeout },
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
