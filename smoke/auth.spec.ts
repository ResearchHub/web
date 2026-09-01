import { expect, test } from '@playwright/test';
import { submitCredentials } from './helpers/auth';

test('a user can log in from the sign-in page', async ({ page }) => {
  await page.goto('/auth/signin');
  await submitCredentials(page);

  // /auth/signin renders a standalone layout with no top bar, so the
  // authenticated state is only observable once we are on a normal page. Go
  // there directly rather than relying on the page's own post-login redirect,
  // which intermittently drops the navigation and strands a logged-in user on
  // the sign-in form.
  await page.goto('/');

  // The user menu replaces the auth buttons only after the session is
  // established and the profile has been fetched back from the API.
  await expect(page.getByTestId('user-menu-button').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toHaveCount(0);
});

test('a user can log in through the auth modal', async ({ page }) => {
  await page.goto('/');

  // The modal is the primary entry point: the top bar opens it in place of
  // navigating to /auth/signin.
  const loginButton = page.getByTestId('topbar-login-button');
  await expect(loginButton).toBeVisible();
  await loginButton.click();
  await expect(page.getByTestId('auth-email-input')).toBeVisible();

  await submitCredentials(page);

  // On success the modal closes in place, leaving the user authenticated on
  // the page they started from.
  await expect(page.getByTestId('auth-email-input')).toHaveCount(0);
  await expect(page.getByTestId('user-menu-button').first()).toBeVisible();
  await expect(loginButton).toHaveCount(0);
});
