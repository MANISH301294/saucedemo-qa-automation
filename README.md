# SauceDemo QA Automation

A small BDD automation framework for [SauceDemo](https://www.saucedemo.com/) using Playwright and TypeScript. Cucumber.js owns the Gherkin scenarios and hooks; Playwright provides browser control and web-first assertions.

## Requirements and setup

- Node.js 20 or newer
- npm

```sh
npm ci
npx playwright install chromium
cp .env.example .env
npm test
```

Run only the tagged smoke scenario with `npm run test:smoke`. Every test run prints a summary and writes an HTML report to `reports/cucumber-report.html` plus a JSON report to `reports/cucumber-report.json`. TypeScript type checking is available with `npm run typecheck`. Playwright browser binaries are installed separately from npm dependencies.

## Configuration

Copy `.env.example` to `.env`. `BASE_URL` selects the application, `BROWSER` accepts `chromium`, `firefox`, or `webkit`, and `HEADLESS` controls visibility. `SLOW_MO` adds a configurable debugging delay. `ACTION_TIMEOUT` sets the default locator/action timeout, `NAVIGATION_TIMEOUT` sets navigation waits, `ASSERTION_TIMEOUT` sets Playwright web assertion retries, and `STEP_TIMEOUT` sets the overall Cucumber step timeout; all timeout values are milliseconds. `SCREENSHOT_DIR` controls failure screenshot output and `TRACE_DIR` controls failed-run trace output. Do not commit `.env` or real credentials.

`playwright.config.ts` is the central browser configuration. It defines the base URL, browser, headless mode, action/navigation/assertion timeouts, screenshot-on-failure, retain-trace-on-failure, and SauceDemo's `data-test` test-id attribute. Since scenarios run through Cucumber rather than Playwright Test, `support/hooks.ts` imports its shared `browserSettings` and applies those options to each scenario's browser context. Failed traces are attached to the Cucumber report and saved under `TRACE_DIR`; open one with `npx playwright show-trace traces/<trace-file>.zip`.

The public SauceDemo demo credentials are fixture data in `testdata/users.json`; they are not secrets. Checkout fixture values are in `testdata/checkout.json`.

## Framework structure

```text
features/   Gherkin feature files only
steps/      Reusable Cucumber step definitions; no selectors
pages/      Page objects with locators, actions, and assertions
support/    Scenario World, browser lifecycle hooks, DB utility
config/     Environment-driven configuration
testdata/   User and checkout fixtures
```

The features cover a standard user's single-item purchase through order completion and a failed login that stays on the login page. Each scenario gets its own browser context. The After hook closes resources and attaches a full-page screenshot to Cucumber's report when a scenario fails.

## Locator Strategy for Adding “Sauce Labs Backpack”

**Preferred approach:** find the inventory item card by its stable `data-test="inventory-item"` attribute and filter that collection by the exact product name, then click the product's explicit `data-test="add-to-cart-sauce-labs-backpack"` button. This scopes the action to the named item, survives changes to product ordering and page styling, and avoids selecting a button by its position. The implementation is in `pages/InventoryPage.ts`.

**Fallback approach:** within the same name-filtered inventory item card, locate the button by its accessible role and name (`getByRole('button', { name: 'Add to cart' })`). This uses the user's visible control label and remains scoped to the product, though it depends on the label and can change to “Remove” after adding.

## Wait strategy and stability

The suite uses Playwright's locator actions and `expect` assertions. They wait for relevant elements to become actionable or satisfy an expected state within the configured timeout. For example, the product card must be visible, the cart badge must become `1`, and the completion heading must appear. This ties waiting to observable application state instead of elapsed time, so there are no hard sleeps. A timeout gives a bounded, actionable failure if the state never arrives.

## Database integration design

SauceDemo does not expose a database, so the live UI scenarios do not pretend to verify a DB record. `support/db.ts` provides an optional, config-driven PostgreSQL pool with connection checks, parameterized query execution, transaction support, error context, and clean teardown. The credentials are read from `DB_*` environment variables.

Example integration pseudocode for a system that does persist orders:

```ts
const testRunId = crypto.randomUUID(); // unique isolation key for this scenario
try {
  await ui.placeOrder({ reference: testRunId, ...fixture });
  await expect.poll(async () => {
    const result = await db.query(
      'SELECT status, customer_email FROM orders WHERE test_run_id = $1',
      [testRunId],
    );
    return result.rows[0] ?? null;
  }, { timeout: 10_000, intervals: [250, 500, 1_000, 2_000] })
    .toMatchObject({ status: 'CONFIRMED' });
} finally {
  await db.query('DELETE FROM orders WHERE test_run_id = $1', [testRunId]);
  await db.close();
}
```

In a real suite, use a unique run/scenario key to isolate records, parameterize every query, retry reads for bounded eventual consistency, and clean up only records owned by that key (or use a rollback transaction where the system permits it). Never use shared production records as test fixtures.

## Engineering decisions and scaling

1. **Structure:** Gherkin states user intent, step definitions translate that intent into page-object calls, page objects own selectors and interactions, and support/config/testdata handle shared infrastructure. This keeps selectors out of steps and reduces duplication.
2. **Waits:** Playwright's auto-waiting actions and retrying assertions synchronize on actual UI state with a finite timeout rather than fixed delays.
3. **Locators:** stable test IDs and exact product-name scoping avoid positional selectors and fragile XPath chains; role/name locators are used for meaningful user-facing controls.
4. **50+ scenarios:** split features by domain, keep step wording reusable, extract shared domain workflows, use tags for suites, isolate test data per scenario, keep hooks thin, and shard independent scenarios in CI. Avoid a universal page object with unrelated actions.
5. **CI/CD:** `.github/workflows/ci.yml` runs on every push and pull request. It sets up Node, installs dependencies and Chromium, type-checks the project, runs Cucumber scenarios, uploads the HTML/JSON reports on every run, and includes screenshots/traces when available. Secrets belong in GitHub Actions secrets, not in the repository.
6. **Next improvements:** expand the existing CI workflow with a browser matrix and sharding, add richer typed test-data builders, and add contract-level checks if the application exposes test APIs.

## GitHub Actions

The workflow at `.github/workflows/ci.yml` runs on every push and pull request. It installs Node dependencies and Chromium, type-checks the TypeScript project, runs both Cucumber features, and uploads the HTML/JSON reports as a downloadable artifact. It also includes screenshots and traces when those files exist.

## AI disclosure

AI assistance was used to scaffold this framework, implement the initial page objects, steps, hooks, DB example, and draft this README from the take-home requirements. Review and adapt the code, run it in your environment, and be prepared to explain and modify every part during the technical discussion. No video or claim of a completed run was generated.

