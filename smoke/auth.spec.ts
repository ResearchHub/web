import { expect, test } from '@playwright/test';
import { mockApiPost } from './helpers/api';
import { logIn, smokeCredentials, submitCredentials, uniqueEmail } from './helpers/auth';

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

test('a user can request a password reset from the auth modal', async ({ page }) => {
  // Mocked so that a run cannot mail a real inbox or trip rate limiting on the
  // endpoint. The request is still asserted below, so what the form sends stays
  // covered; only Django's own handling of it is out of scope.
  const resetRequests = await mockApiPost(page, '/api/auth/password-reset/');

  await page.goto('/');
  await page.getByTestId('topbar-login-button').click();

  // The reset link lives on the password step, which check_account only opens
  // for an account that exists and is verified, so this has to be driven as the
  // smoke user rather than an arbitrary address.
  const { email } = smokeCredentials();
  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-email-continue').click();
  await page.getByTestId('auth-forgot-password').click();

  // The screen carries the address over from the email step, so a user who got
  // here through the modal never retypes it.
  await expect(page.getByTestId('auth-forgot-email-input')).toHaveValue(email);
  await page.getByTestId('auth-forgot-submit').click();

  await expect(page.getByRole('heading', { name: 'Request submitted' })).toBeVisible();
  await expect(page.getByText(`password reset link to ${email}`)).toBeVisible();
  expect(resetRequests).toEqual([{ body: { email } }]);
});

test('a user can register a new account with an email address', async ({ page }) => {
  // Mocked: a real registration would leave an account behind on every pull
  // request that no one can ever verify, since CI has no inbox to confirm from.
  const registrations = await mockApiPost(page, '/api/auth/register/', {
    status: 201,
    body: { id: 1 },
  });

  const email = uniqueEmail();
  await page.goto('/');
  await page.getByTestId('topbar-login-button').click();

  // check_account is deliberately left unmocked. A freshly generated address
  // genuinely has no account, and it is that real response which decides
  // between the login and signup screens.
  await page.getByTestId('auth-email-input').fill(email);
  await page.getByTestId('auth-email-continue').click();
  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

  await page.getByTestId('auth-signup-name-input').fill('Smoke Tester');
  await page.getByTestId('auth-signup-password-input').fill('SmokeTest!2468');
  await page.getByTestId('auth-signup-submit').click();

  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await expect(page.getByText(`verification link to ${email}`)).toBeVisible();

  // With the response faked, the request is the only real evidence the form
  // works: in particular that the single name field was split into the two
  // Django expects.
  expect(registrations).toHaveLength(1);
  expect(registrations[0].body).toMatchObject({
    email,
    password1: 'SmokeTest!2468',
    password2: 'SmokeTest!2468',
    first_name: 'Smoke',
    last_name: 'Tester',
  });
});

test('a user can log out from the user menu', async ({ page }) => {
  await logIn(page);
  await page.goto('/');

  await page.getByTestId('user-menu-button').first().click();
  await page.getByTestId('user-menu-signout').click();

  // Signing out also clears the token shared with the other app and redirects
  // home, but the observable result is the top bar reverting to its
  // logged-out controls. Asserting that rather than the URL keeps this
  // independent of the redirect flakiness noted above.
  await expect(page.getByTestId('topbar-login-button')).toBeVisible();
  await expect(page.getByTestId('user-menu-button')).toHaveCount(0);
});
