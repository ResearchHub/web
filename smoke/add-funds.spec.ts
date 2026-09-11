import { expect, test, type Page } from '@playwright/test';
import { logIn } from './helpers/auth';

const PAYMENT_INTENT = '/api/payment/payment-intent/';

/**
 * Stripe's public test card. It is not a secret and never moves real money;
 * the local backend runs against Stripe test mode.
 */
const TEST_CARD = { number: '4242424242424242', expiry: '12 / 34', cvc: '123', zip: '12345' };

/**
 * The Stripe CardElement renders every field inside one iframe. Its name is
 * generated, so the locator matches on the stable prefix.
 */
async function fillStripeCard(page: Page) {
  const frame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
  await frame.getByPlaceholder('Card number').fill(TEST_CARD.number);
  await frame.getByPlaceholder('MM / YY').fill(TEST_CARD.expiry);
  await frame.getByPlaceholder('CVC').fill(TEST_CARD.cvc);
  await frame.getByPlaceholder('ZIP').fill(TEST_CARD.zip);
}

test('cash in the Add funds modal buys funding credits by card', async ({ page }) => {
  await logIn(page);
  await page.goto('/');

  await page
    .getByRole('button', { name: /Add funds/ })
    .first()
    .click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByText('Add funds')).toBeVisible();
  await expect(modal.getByText('Buy funding credits')).toBeVisible();

  await modal.getByRole('button', { name: /^Cash/ }).click();
  await expect(modal.getByText('Buy funding credits')).toBeVisible();
  await expect(modal.getByText(/Your cash becomes funding credits/)).toBeVisible();

  const amountInput = modal.locator('input[inputmode="decimal"]');
  await amountInput.fill('25');
  await expect(modal.getByText(/You.ll receive about/)).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('cash-amount.png') });

  await modal.getByRole('button', { name: /Continue to payment/ }).click();
  await expect(modal.getByText('Select payment method')).toBeVisible();

  // Only Stripe-backed methods are offered: buying credits with credits or
  // RSC would be circular, and there is no fundraise for a DAF to give to.
  await modal
    .getByRole('button', { name: /Select payment option|Credit Card|Apple Pay|Google Pay/ })
    .first()
    .click();
  await expect(modal.getByText('Funding Credits', { exact: true })).toHaveCount(0);
  await expect(modal.getByText('ResearchCoin', { exact: true })).toHaveCount(0);
  await expect(modal.getByText('Donor-Advised Fund (DAF)')).toHaveCount(0);
  // The collapsed header repeats the selected method's name; pick the option row.
  await modal
    .getByRole('button', { name: /^Credit Card/ })
    .last()
    .click();

  // The receipt charges only the purchase fee up front; the contribution fee
  // is taken when the credits are spent.
  await expect(modal.getByText('Funding credits', { exact: true })).toBeVisible();
  await expect(modal.getByText('Platform fee (2%)')).toBeVisible();
  await expect(modal.getByText(/platform fee applies when you spend them/)).toBeVisible();

  await fillStripeCard(page);
  await page.screenshot({ path: test.info().outputPath('cash-payment.png') });

  const intentRequest = page.waitForRequest(
    (request) => new URL(request.url()).pathname === PAYMENT_INTENT && request.method() === 'POST'
  );
  await modal.getByRole('button', { name: 'Confirm & Pay' }).click();
  const body = (await intentRequest).postDataJSON();
  expect(body).toMatchObject({ currency: 'RSC', purpose: 'FUNDING_CREDITS_PURCHASE' });
  expect(body).not.toHaveProperty('fundraise_id');
  expect(body).not.toHaveProperty('funding_pool_id');

  await expect(page.getByText('Funding credits added to your funding power.')).toBeVisible();
  await expect(page.getByText('Select payment method')).toHaveCount(0);
});
