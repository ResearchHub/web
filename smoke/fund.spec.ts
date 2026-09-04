import { expect, test, type Page, type Request } from '@playwright/test';

const GRANT_FEED = '/api/grant_feed/';
const FUNDING_FEED = '/api/funding_feed/';

/**
 * A sort change refetches immediately, unlike a first page load, so these waits
 * are capped well below the test timeout. A broken control then reports in
 * seconds instead of consuming the whole budget, twice over once CI retries.
 */
const SORT_CHANGE_TIMEOUT = 15_000;

/**
 * Neither feed writes its sort to the URL, and neither card renders a date in
 * any machine-readable form, so the request the frontend builds is the only
 * place the chosen order is observable. Matching on pathname keeps this working
 * whichever origin NEXT_PUBLIC_API_URL points at.
 */
function feedRequest(pathname: string, ordering: string) {
  return (request: Request) => {
    const url = new URL(request.url());
    return url.pathname === pathname && url.searchParams.get('ordering') === ordering;
  };
}

/** Opens a feed's sort dropdown and picks an option by its visible label. */
async function selectSort(page: Page, label: string) {
  await page.getByTestId('feed-sort-trigger').click();
  await page.getByRole('option', { name: label }).click();
}

test('the RFP feed renders results from the API', async ({ page }) => {
  await page.goto('/fund');

  // As with the activity feed, a failed fetch is swallowed in favour of the
  // empty state rather than an error page, so assert that state is absent too.
  await expect(page.getByTestId('grant-card').first()).toBeVisible();
  await expect(page.getByText('No open awards right now')).toHaveCount(0);
});

test('the RFP feed can be sorted by newest', async ({ page }) => {
  const initialNewest = page.waitForRequest(feedRequest(GRANT_FEED, 'newest'));
  await page.goto('/fund');
  await initialNewest;
  await expect(page.getByTestId('grant-card').first()).toBeVisible();

  // This feed already defaults to newest, so selecting it on a fresh page would
  // pass even with the dropdown wired to nothing. Sorting away and back is what
  // makes the assertion depend on the control actually driving the query.
  const byAmount = page.waitForRequest(feedRequest(GRANT_FEED, 'amount_raised'), {
    timeout: SORT_CHANGE_TIMEOUT,
  });
  await selectSort(page, 'Highest amount');
  await byAmount;

  const backToNewest = page.waitForRequest(feedRequest(GRANT_FEED, 'newest'), {
    timeout: SORT_CHANGE_TIMEOUT,
  });
  await selectSort(page, 'Newest');
  await backToNewest;

  await expect(page.getByTestId('grant-card').first()).toBeVisible();
});

test('the proposals feed renders results from the API', async ({ page }) => {
  await page.goto('/fund/proposals');

  await expect(page.getByTestId('proposal-card').first()).toBeVisible();
  await expect(page.getByText('No proposals submitted yet')).toHaveCount(0);
});

test('the proposals feed can be sorted by newest', async ({ page }) => {
  // Unlike the RFP feed this one defaults to 'best', so choosing Newest is
  // already a real change of order and needs no round trip to mean something.
  const initialBest = page.waitForRequest(feedRequest(FUNDING_FEED, 'best'));
  await page.goto('/fund/proposals');
  await initialBest;

  const byNewest = page.waitForRequest(feedRequest(FUNDING_FEED, 'newest'), {
    timeout: SORT_CHANGE_TIMEOUT,
  });
  await selectSort(page, 'Newest');
  await byNewest;

  await expect(page.getByTestId('proposal-card').first()).toBeVisible();
});
