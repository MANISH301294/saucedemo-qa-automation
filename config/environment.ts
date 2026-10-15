import 'dotenv/config';

function booleanValue(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

export const environment = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  browser: process.env.BROWSER ?? 'chromium',
  headless: booleanValue(process.env.HEADLESS, true),
  slowMo: Number(process.env.SLOW_MO ?? 0),
  actionTimeout: Number(process.env.ACTION_TIMEOUT ?? 10_000),
  navigationTimeout: Number(process.env.NAVIGATION_TIMEOUT ?? 15_000),
  assertionTimeout: Number(process.env.ASSERTION_TIMEOUT ?? 5_000),
  stepTimeout: Number(process.env.STEP_TIMEOUT ?? 30_000),
  screenshotDir: process.env.SCREENSHOT_DIR ?? './screenshots',
  traceDir: process.env.TRACE_DIR ?? './traces',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: booleanValue(process.env.DB_SSL, false),
  },
} as const;

export function validateBrowser(): 'chromium' | 'firefox' | 'webkit' {
  const browser = environment.browser.toLowerCase();
  if (browser === 'chromium' || browser === 'firefox' || browser === 'webkit') return browser;
  throw new Error(`Unsupported BROWSER "${environment.browser}". Use chromium, firefox, or webkit.`);
}
