import { randomUUID } from 'node:crypto';
import { expect, type Page } from '@playwright/test';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required to run the smoke tests. ` +
        'Set it in .env.development, or pass it inline on the command line.'
    );
  }
  return value;
}

/** Credentials for the dedicated smoke-test account, from the environment. */
export function smokeCredentials() {
  return {
    email: requiredEnv('SMOKE_USER_EMAIL'),
    password: requiredEnv('SMOKE_USER_PASSWORD'),
  };
}

/**
 * An address for the registration spec that no account can already own.
 *
 * example.com is reserved by RFC 2606 and can never receive mail, so nothing
 * reaches a real person even if a request escapes the mock. Randomised per
 * call rather than per run because a retry that reused an address would find
 * the account from the previous attempt: check_account would report it as
 * existing and route the modal into the login flow, and the test would pass
 * while exercising the wrong screen.
 */
export function uniqueEmail(): string {
  return `rh-smoke-${randomUUID()}@example.com`;
}

/**
 * Drives the two-step credential form, which is shared by the /auth/signin
 * route and the auth modal. The caller is responsible for opening it, so this
 * works for either entry point.
 *
 * Resolves once NextAuth has committed the session, meaning it is safe to
 * assert on authenticated UI or navigate immediately afterwards.
 */
export async function submitCredentials(page: Page) {
  const { email, password } = smokeCredentials();

  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-email-continue').click();

  // The password step is only rendered once /api/user/check_account/ confirms
  // the account exists and is verified.
  const passwordInput = page.getByTestId('auth-password-input');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(password);

  // Once Django accepts the password, NextAuth commits the session in a
  // separate callback request. Wait for it so that neither the assertions nor
  // a following navigation can race the session being established.
  const sessionCommitted = page.waitForResponse(
    (response) => response.url().includes('/api/auth/callback/credentials') && response.ok()
  );
  await page.getByTestId('auth-login-submit').click();
  await sessionCommitted;
}

/**
 * Establishes an authenticated session from a cold start, for specs that need
 * a logged-in user rather than ones testing login itself. Goes through
 * /auth/signin rather than the top bar modal because that entry point exists
 * at every viewport. The session cookie is set on the browser context, so
 * callers should navigate to whichever page they actually want to exercise.
 */
export async function logIn(page: Page) {
  await page.goto('/auth/signin');
  await submitCredentials(page);
}
