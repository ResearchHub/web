import { expect, test } from '@playwright/test';
import { logIn } from './helpers/auth';
import { proposalPostId } from './helpers/fixtures';

/**
 * Stops at the payment step: confirming would move real (test-mode) money and
 * change the fixture's raised total. The amount step and the receipt are the
 * parts shared with the funding credits purchase, which is what this guards.
 *
 * The fixture's fundraise has to be open, since the modal is only offered on
 * an active proposal.
 */
test('the fund proposal modal reaches the payment step', async ({ page }) => {
  await logIn(page);
  await page.goto(`/proposal/${proposalPostId()}`);

  await page.getByRole('button', { name: 'Fund Proposal' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByText('Fund Proposal')).toBeVisible();

  const amountInput = modal.locator('input[inputmode="decimal"]');
  await amountInput.fill('0.5');
  await expect(modal.getByText('Minimum contribution is $1')).toBeVisible();
  await expect(modal.getByRole('button', { name: /Continue to Payment/ })).toBeDisabled();

  await modal.getByRole('button', { name: '$100', exact: true }).click();
  await expect(amountInput).toHaveValue('100');
  await modal.getByRole('button', { name: /Continue to Payment/ }).click();

  await expect(modal.getByText('Select Payment Method')).toBeVisible();
  await modal
    .getByRole('button', { name: /^Credit Card/ })
    .last()
    .click();
  await expect(modal.getByText('Funding contribution')).toBeVisible();
  await expect(modal.getByText('Platform fee (9%)')).toBeVisible();
  await expect(modal.getByText('$100.00').first()).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('contribute-payment.png') });
});
