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

export default defineConfig({
  testDir: './smoke',
  // Deployed environments are slower than local, and these tests wait on a
  // round trip through Next.js, the Django API and Postgres.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  // Playwright parallelises by file, and concurrent browsers overwhelm a local
  // dev server: three at once pushed every test near the 60s timeout. The suite
  // is small enough that running it serially costs little and stays reliable.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
