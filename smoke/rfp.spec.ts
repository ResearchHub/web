import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { logIn } from './helpers/auth';
import { openNotebookEditor } from './helpers/notebook';

/**
 * An RFP is a grant: the notebook calls the work type `grant`, the API calls
 * the document type `GRANT`, the published work's content type is
 * `funding_request`, and only the UI says "RFP". All four appear below.
 */

/**
 * Both titles are randomised so a leftover from a failed run is identifiable,
 * and kept over 20 characters because the confirm dialog and Django
 * (MIN_POST_TITLE_LENGTH) both reject anything shorter.
 */
const rfpTitle = () => `Smoke test RFP, please ignore ${randomUUID().slice(0, 8)}`;

const isPostUpsert = (url: string) => new URL(url).pathname === '/api/researchhubpost/';

/**
 * Picks the first topic matching a query. Scoped to its own section on
 * purpose: unscoped, `option` also matches the currency select in the sidebar,
 * whose entries carry the same role and can win the race for `.first()`.
 */
async function selectFirstTopic(page: Page) {
  const topics = page.getByTestId('topics-section');
  await topics.getByPlaceholder('Search topics...').fill('bio');

  const firstTopic = topics.getByRole('option').first();
  await expect(firstTopic).toBeVisible();
  const topicName = (await firstTopic.innerText()).trim();
  await firstTopic.click();

  // The list stays open on select, so it is dismissed first: the remaining
  // copy of the label is then the chip for the chosen topic, which is what
  // shows the selection registered rather than silently missing.
  await page.keyboard.press('Escape');
  await expect(topics.getByText(topicName, { exact: true })).toBeVisible();
}

/** Fills in the confirm dialog and publishes, returning the upsert response. */
async function confirmPublish(page: Page, title: string) {
  const titleField = page.getByTestId('confirm-publish-title');
  await expect(titleField).toBeVisible();
  await titleField.fill(title);
  await page.getByLabel('I have adhered to the ResearchHub posting guidelines').check();

  const published = page.waitForResponse(
    (response) => isPostUpsert(response.url()) && response.request().method() === 'POST'
  );
  await page.getByTestId('confirm-publish-submit').click();
  return published;
}

/**
 * The edit below retitles the RFP published above rather than a pinned
 * fixture, and the two run in order for that reason.
 *
 * Editing an RFP means reopening the notebook note it was published from, and
 * a note lives in the personal notebook of whoever wrote it. Transferring the
 * post to another account leaves the note where it was, and a personal
 * notebook takes no second member — so an RFP authored by anyone but the smoke
 * account is permanently uneditable here, however its post is owned. Creating
 * one first is the only way to be sure there is something to edit, and it
 * costs nothing: this file publishes an RFP either way.
 *
 * Serial also means the edit is skipped rather than failed when the publish
 * before it breaks, so one cause reports once.
 */
test.describe.configure({ mode: 'serial' });

/** Where the publish leaves off, and what the edit picks up. */
let grantUrl: string;

/**
 * Note this leaves its RFP behind: publishing is not reversible from the
 * outside. Each run adds one, recognisable by title and safe to decline in
 * whichever environment's moderation queue it lands in.
 */
test('a new RFP can be drafted in the notebook and published', async ({ page }) => {
  // A login, a note created from a template, and a publish, each a round trip
  // through Next.js and Django. The generous budget is mostly for a local run,
  // where the notebook route is compiled on first visit and that alone can
  // take the best part of a minute.
  test.setTimeout(300_000);

  const title = rfpTitle();

  await logIn(page);

  // The route the "New RFP" entry points push to. `/notebook` resolves the
  // user's organisation and carries the query string over to it, and the org
  // page is what turns `newGrant` into a note seeded from the grant template.
  // Driving it by URL rather than through the publish menu keeps this test
  // about the notebook rather than about which menu happens to link to it.
  await page.goto('/notebook?newGrant=true&grantSource=template');

  // Only once the note exists does the URL carry an id, so waiting for it is
  // what confirms the draft was created. Given its own timeout because it is
  // by far the slowest step, so a hang here reports as itself rather than as
  // the whole test running out of budget.
  await page.waitForURL(/\/notebook\/[^/]+\/\d+/, { timeout: 120_000 });

  await page.getByTestId('notebook-add-details').click();

  // Topics, a short description and a funding amount are what the schema
  // demands of a grant. Contacts are required too but deliberately not filled:
  // the form seeds them with the current user, and asserting the publish
  // payload carries one covers that without driving a user search.
  await selectFirstTopic(page);
  await page
    .getByTestId('grant-description-input')
    .fill('Smoke test RFP. Please ignore — created by the automated smoke suite.');
  await page.getByTestId('grant-amount-input').fill('10000');

  await page.getByTestId('publishing-form-submit').click();

  const response = await confirmPublish(page, title);
  expect(response.ok()).toBe(true);

  // The grant fields are invisible on the page at this stage — a pending RFP
  // does not render as an open one — so the request is where they have to be
  // asserted. `grant_contacts` in particular is the only evidence that the
  // form seeded a contact rather than publishing without one.
  const payload = response.request().postDataJSON();
  expect(payload).toMatchObject({
    document_type: 'GRANT',
    title,
    grant_amount: 10000,
    grant_currency: 'USD',
  });
  expect(payload.grant_contacts?.length).toBeGreaterThan(0);
  expect(payload.note_id).toBeTruthy();

  // Publishing redirects to the RFP itself, which is the user-visible
  // confirmation that it exists and is readable by its author.
  await page.waitForURL(/\/grant\/\d+\//);
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();

  grantUrl = page.url();
});

test("a published RFP's title can be edited", async ({ page }) => {
  test.setTimeout(300_000);

  const title = rfpTitle();

  // A fresh browser context per test, so the session from the publish above
  // does not carry over even though the grant does.
  await logIn(page);

  await page.goto(grantUrl);

  await openNotebookEditor(page);

  // Nothing is filled in this time: opening an existing RFP repopulates the
  // form from the published grant, so it already satisfies the schema. A
  // validation error here means the publish above wrote a grant the form will
  // not accept back, not that editing is broken.
  await page.getByTestId('notebook-add-details').click();
  await page.getByTestId('publishing-form-submit').click();

  // The dialog distinguishes a republish from a first publish, which is the
  // cheapest available proof that the form knows it is editing rather than
  // creating a second RFP.
  await expect(page.getByRole('heading', { name: 'Confirm Re-publication' })).toBeVisible();

  const response = await confirmPublish(page, title);
  expect(response.ok()).toBe(true);

  // `post_id` is what makes this an update. Without it the same endpoint would
  // happily create a new RFP, and the assertions below would still pass.
  const payload = response.request().postDataJSON();
  expect(payload).toMatchObject({ document_type: 'GRANT', title });
  expect(payload.post_id).toBeTruthy();

  // Republishing redirects back to the RFP, rendered from the response rather
  // than from anything cached in the notebook — so the heading is the title as
  // the API now has it.
  await page.waitForURL(/\/grant\/\d+\//);
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
});
