import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { logIn } from './helpers/auth';
import { grantPostId } from './helpers/fixtures';
import {
  addCover,
  confirmPublish,
  fillDetail,
  openPublishDialog,
  openWorkspaceEditor,
  startBlankDraft,
} from './helpers/workspace';

/**
 * Randomised so that a leftover from a failed run is identifiable, and so two
 * runs never argue over the same title. Kept over 20 characters because both
 * the publish dialog and Django (MIN_POST_TITLE_LENGTH) reject anything
 * shorter — a blank draft's own title is shorter than that, so a title has to
 * be supplied regardless.
 */
const proposalTitle = () => `Smoke test proposal, please ignore ${randomUUID().slice(0, 8)}`;

/**
 * The edit below retitles the proposal published above rather than a pinned
 * fixture, and the two run in order for that reason.
 *
 * Editing a proposal means reopening the workspace document it was published
 * from, which belongs to whoever wrote it — so a proposal drafted by anyone
 * but the smoke account is uneditable here, however its post is owned.
 * Creating one first is the only way to be sure there is something to edit,
 * and it costs nothing: this file publishes a proposal either way.
 *
 * Serial also means the edit is skipped rather than failed when the publish
 * before it breaks, so one cause reports once.
 */
test.describe.configure({ mode: 'serial' });

/** Where the publish leaves off, and what the edit picks up. */
let proposalUrl: string;

/**
 * Note that this leaves its proposal behind: publishing is not reversible from
 * the outside. The author-facing removal endpoint
 * (`DELETE /api/researchhubpost/<id>/censor/`) is broken — it builds its
 * response through a serializer that rejects the arguments the shared mixin
 * passes, and the 500 rolls the removal back inside its own transaction — and
 * the plain destroy route fails the same way on an unimplemented permission
 * check. So every run adds one proposal to whichever environment it ran
 * against, titled to be recognisable and skippable.
 */
test('a new proposal can be drafted from an RFP and published', async ({ page }) => {
  // The longest flow in the suite: a login, a grant page, a draft, an image
  // upload and a publish, each a round trip through Next.js and Django. The
  // generous budget is mostly for a local run, where the workspace route is
  // compiled on first visit and that alone can take the best part of a
  // minute; a deployed environment serves it prebuilt.
  test.setTimeout(300_000);

  const title = proposalTitle();

  await logIn(page);
  await page.goto(`/rfp/${grantPostId()}`);

  // The entry point only exists while the RFP is open for applications, so a
  // closed or expired fixture fails here rather than somewhere confusing.
  // HeroHeader renders its call to action twice — a desktop copy and a mobile
  // one, with the other hidden — so this has to select on visibility rather
  // than position to stay correct at any viewport.
  const submitProposal = page.getByTestId('grant-submit-proposal').filter({ visible: true });
  await expect(submitProposal).toBeVisible();
  await submitProposal.click();

  // Apply opens the workspace's proposal start screen with the RFP already
  // picked, and the blank draft started from there answers it.
  await page.waitForURL(/\/workspace\?new=proposal&rfp=\d+/);
  await expect(page.getByTestId('workspace-applying-to')).toBeVisible();
  await startBlankDraft(page);
  await addCover(page);

  const dialog = await openPublishDialog(page);
  await expect(dialog.getByRole('heading', { name: 'Submit application' })).toBeVisible();

  // An author is required too but not given: the form seeds it with the
  // current user.
  await fillDetail(dialog, 'Title', 'Title', title);
  await fillDetail(dialog, 'Funding goal', 'Funding goal in US dollars', '1000');

  const response = await confirmPublish(page, dialog);
  expect(response.status()).toBe(200);

  // The RFP link is the whole point of this flow and is invisible in the UI at
  // this stage, so the request is where it has to be asserted. Only that a
  // grant was attached, not which one: SMOKE_GRANT_POST_ID is the post id the URL
  // uses, while the payload carries the id of the grant record hanging off it,
  // and the two are different numbers.
  const payload = response.request().postDataJSON();
  expect(payload).toMatchObject({ title });
  expect(payload.grant_id).toBeTruthy();

  // Publishing redirects to the proposal itself, which is the user-visible
  // confirmation that it exists and is readable.
  await page.waitForURL(/\/proposal\/\d+\//);

  // That redirect carries `?new=true`, which opens a celebration dialog over
  // the page and takes the document out of the accessibility tree with it.
  // Dropping the parameter makes the assertion about the published proposal
  // rather than the modal sitting on top of it.
  const canonical = new URL(page.url());
  canonical.searchParams.delete('new');
  await page.goto(canonical.toString());

  // The title lands on the page twice as an h1: once in the header, from the
  // post record the API returned, and once in the document body, from the
  // editor content. Either proves the publish, but the body one mounts a beat
  // later — matching both is a race that only shows up on a slower run.
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();

  proposalUrl = canonical.toString();
});

test("a published proposal's title can be edited", async ({ page }) => {
  test.setTimeout(300_000);

  const title = proposalTitle();

  // A fresh browser context per test, so the session from the publish above
  // does not carry over even though the proposal does.
  await logIn(page);

  await page.goto(proposalUrl);

  await openWorkspaceEditor(page);

  // The dialog distinguishes an update from a first publish, which is the
  // cheapest available proof the form knows it is editing rather than creating
  // a second proposal.
  const dialog = await openPublishDialog(page);
  await expect(dialog.getByRole('heading', { name: 'Update proposal' })).toBeVisible();

  // Only the title is given: opening an existing proposal repopulates the form
  // from the published post, so it already has everything else. A missing
  // detail here means the publish above wrote a proposal the form will not
  // accept back, not that editing is broken.
  await fillDetail(dialog, 'Title', 'Title', title);

  const response = await confirmPublish(page, dialog);
  expect(response.ok()).toBe(true);

  // `post_id` is what makes this an update. Without it the same endpoint would
  // happily create a second proposal, and the assertions below would still
  // pass against it.
  const payload = response.request().postDataJSON();
  expect(payload).toMatchObject({ document_type: 'PREREGISTRATION', title });
  expect(payload.post_id).toBeTruthy();

  await page.waitForURL(/\/proposal\/\d+\//);
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
});
