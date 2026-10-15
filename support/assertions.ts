import { expect as playwrightExpect } from '@playwright/test';
import { browserSettings } from '../playwright.config';

/** Shared Playwright web assertions with the suite's configured retry timeout. */
export const expect = playwrightExpect.configure({ timeout: browserSettings.assertionTimeout });
