import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { logIn } from './helpers/auth';
import {
  addCover,
  confirmPublish,
  fillDetail,
  openPublishDialog,
  openWorkspaceEditor,
  startBlankDraft,
} from './helpers/workspace';

/**
 * An RFP is a grant: the publishing form calls the work type `grant`, the API
 * calls the document type `GRANT`, the published work's content type is
 * `funding_request`, and only the UI says "RFP". All four appear below.
 */

/**
 * Both titles are randomised so a leftover from a failed run is identifiable,
 * and kept over 20 characters because the publish dialog and Django
 * (MIN_POST_TITLE_LENGTH) both reject anything shorter.
 */
const rfpTitle = () => `Smoke test RFP, please ignore ${randomUUID().slice(0, 8)}`;

/**
 * The edit below retitles the RFP published above rather than a pinned
 * fixture, and the two run in order for that reason.
 *
 * Editing an RFP means reopening the workspace document it was published
 * from, which belongs to whoever wrote it — so an RFP authored by anyone but
 * the smoke account is uneditable here, however its post is owned. Creating
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
test('a new RFP can be drafted in the workspace and published', async ({ page }) => {
  // A login, a draft, an upload and a publish, each a round trip through
  // Next.js and Django. The generous budget is mostly for a local run, where
  // the workspace route is compiled on first visit and that alone can take
  // the best part of a minute.
  test.setTimeout(300_000);

  const title = rfpTitle();

  await logIn(page);

  // The start screen the "New RFP" entry points open. Driving it by URL rather
  // than through a menu keeps this test about the workspace rather than about
  // which menu happens to link to it.
  await page.goto('/workspace?new=rfp');
  await startBlankDraft(page);
  await addCover(page);

  const dialog = await openPublishDialog(page);
  await expect(dialog.getByRole('heading', { name: 'Publish RFP' })).toBeVisible();

  // A title, a short description, a funding amount and the cover are what an
  // RFP cannot be published without. A contact is required too but
  // deliberately not given: the form seeds it with the current user, and
  // asserting the publish payload carries one covers that without driving a
  // user search.
  await fillDetail(dialog, 'Title', 'Title', title);
  await fillDetail(
    dialog,
    'Short description',
    'Short description',
    'Smoke test RFP. Please ignore — created by the automated smoke suite.'
  );
  await fillDetail(dialog, 'Funding amount', 'Funding amount in US dollars', '10000');

  const response = await confirmPublish(page, dialog);
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
  await page.waitForURL(/\/rfp\/\d+\//);
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

  await openWorkspaceEditor(page);

  // The dialog distinguishes an update from a first publish, which is the
  // cheapest available proof that the form knows it is editing rather than
  // creating a second RFP.
  const dialog = await openPublishDialog(page);
  await expect(dialog.getByRole('heading', { name: 'Update RFP' })).toBeVisible();

  // Only the title is given: opening an existing RFP repopulates the form from
  // the published grant, so it already has everything else. A missing detail
  // here means the publish above wrote a grant the form will not accept back,
  // not that editing is broken.
  await fillDetail(dialog, 'Title', 'Title', title);

  const response = await confirmPublish(page, dialog);
  expect(response.ok()).toBe(true);

  // `post_id` is what makes this an update. Without it the same endpoint would
  // happily create a new RFP, and the assertions below would still pass.
  const payload = response.request().postDataJSON();
  expect(payload).toMatchObject({ document_type: 'GRANT', title });
  expect(payload.post_id).toBeTruthy();

  // Updating redirects back to the RFP, rendered from the response rather than
  // from anything cached in the workspace — so the heading is the title as the
  // API now has it.
  await page.waitForURL(/\/rfp\/\d+\//);
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
});
