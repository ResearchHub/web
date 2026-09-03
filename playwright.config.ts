import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

// Read the same env files Next.js uses so a local run needs no extra setup.
// Variables already present in the shell take precedence, so CI and one-off
// runs can point the suite at another environment without editing any file.
for (const file of ['.env.local', '.env.development']) {
  const path = join(__dirname, file);
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}

const baseURL = process.env.SMOKE_BASE_URL;
if (!baseURL) {
  throw new Error(
    'SMOKE_BASE_URL is required to run the smoke tests, and has no default.\n' +
      'Set it in .env.development (e.g. SMOKE_BASE_URL=http://localhost:3000)\n' +
      'or inline: SMOKE_BASE_URL=https://staging.researchhub.com npm run test:smoke'
  );
}

const isLocalServer = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(baseURL);

export default defineConfig({
  testDir: './smoke',
  // Deployed environments are slower than local, and these tests wait on a
  // round trip through Next.js, the Django API and Postgres.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  // Playwright parallelises by file, which takes the wall clock from the sum of
  // the files to the longest one — worth a lot here, where the notebook specs
  // run minutes and the rest run seconds.
  //
  // Only off against a local dev server, which compiles routes on demand and
  // buckles under concurrent browsers: three at once pushed every test near the
  // 60s timeout. A deployed environment serves those routes prebuilt.
  //
  // Files that must not interleave say so themselves, with
  // `test.describe.configure({ mode: 'serial' })`; nothing here depends on the
  // worker count for ordering.
  workers: isLocalServer ? 1 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
