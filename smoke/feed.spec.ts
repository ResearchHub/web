import { expect, test } from '@playwright/test';

test('home feed renders content from the API', async ({ page }) => {
  await page.goto('/');

  // Feed cards only exist once /api/activity_feed/ has returned records, so an
  // unreachable API fails this assertion. ActivityService swallows fetch errors
  // and falls back to the empty state rather than an error page, which would
  // otherwise look like a healthy render, so assert that state is absent too.
  const firstCard = page.getByTestId('activity-card').first();
  await expect(firstCard).toBeVisible();
  await expect(firstCard).not.toBeEmpty();
  await expect(page.getByText('No activity found')).toHaveCount(0);
});
