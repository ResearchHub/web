import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { logIn } from './helpers/auth';
import { openNotebookEditor } from './helpers/notebook';
import { grantPostId } from './helpers/fixtures';

/**
 * A 64x64 PNG, inline rather than a committed binary. A cover image is required
 * to publish a proposal and there is no default, so something has to be
 * uploaded; nothing about the flow cares what it depicts.
 */
const COVER_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAUElEQVR42u3PQQkAAAgEsOufzLchzGEE' +
    '38JgBZbqeS0CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApcF3mo' +
    'CWVPTG70AAAAASUVORK5CYII=',
  'base64'
);

/**
 * Randomised so that a leftover from a failed run is identifiable, and so two
 * runs never argue over the same title. Kept over 20 characters because both
 * the confirm dialog and Django (MIN_POST_TITLE_LENGTH) reject anything
 * shorter — the proposal template's own heading, "Proposal Template", is 17,
 * so a title has to be supplied regardless.
 */
const proposalTitle = () => `Smoke test proposal, please ignore ${randomUUID().slice(0, 8)}`;

/**
 * The edit below retitles the proposal published above rather than a pinned
 * fixture, and the two run in order for that reason.
 *
 * Editing a proposal means reopening the notebook note it was published from,
 * and a note lives in the personal notebook of whoever wrote it. Transferring
 * the post to another account leaves the note where it was, and a personal
 * notebook takes no second member — so a proposal drafted by anyone but the
 * smoke account is permanently uneditable here, however its post is owned.
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
  // The longest flow in the suite: a login, a grant page, a note created from
  // a template, an image upload and a publish, each a round trip through
  // Next.js and Django. The generous budget is mostly for a local run, where
  // the notebook route is compiled on first visit and that alone can take the
  // best part of a minute; a deployed environment serves it prebuilt.
  test.setTimeout(300_000);

  const title = proposalTitle();

  await logIn(page);
  await page.goto(`/grant/${grantPostId()}`);

  // The entry point only exists while the RFP is open for applications, so a
  // closed or expired fixture fails here rather than somewhere confusing.
  // HeroHeader renders its call to action twice — a desktop copy and a mobile
  // one, with the other hidden — so this has to select on visibility rather
  // than position to stay correct at any viewport.
  const submitProposal = page.getByTestId('grant-submit-proposal').filter({ visible: true });
  await expect(submitProposal).toBeVisible();
  await submitProposal.click();

  // Two ways to apply: continue an existing draft, or start a new one. Only
  // the second creates a note from the proposal template.
  //
  // Retried as a unit because the modal throws the choice away underneath it.
  // Its reset effect keys on the selected organisation, `OrganizationContext`
  // resolves that a few seconds after the page loads, and the reset that fires
  // when it lands clears the selection — leaving Continue disabled with no
  // radio checked, which is what a user sees if they choose quickly too. The
  // click on Continue is inside the loop so that a selection wiped between
  // choosing and confirming is simply made again.
  await expect(async () => {
    await page.getByTestId('apply-draft-new').click();
    await page.getByTestId('apply-continue').click({ timeout: 5_000 });
    await page.waitForURL(/\/notebook/, { timeout: 10_000 });
  }).toPass({ timeout: 120_000 });

  // /notebook resolves the user's organisation, the org page creates the note
  // from the proposal template, and only then does the URL carry a note id.
  // Waiting for that id is what confirms the draft exists — and it is the
  // point from which this test has something to clean up. Given its own
  // timeout because it is by far the slowest step, so a hang here reports as
  // itself rather than as the whole test running out of budget.
  await page.waitForURL(/\/notebook\/[^/]+\/\d+/, { timeout: 120_000 });

  await page.getByTestId('notebook-add-details').click();

  // Topics, funding goal and cover image are all required by the form's
  // schema. Authors are not filled here: the form adds the current user on
  // its own for a new proposal.
  //
  // The topic lookup is scoped to its own section on purpose. Unscoped,
  // `option` also matches the currency <select> in the sidebar, whose RSC and
  // USD entries carry the same role and can win the race for `.first()`.
  const topics = page.getByTestId('topics-section');
  await topics.getByPlaceholder('Search topics...').fill('bio');
  const firstTopic = topics.getByRole('option').first();
  await expect(firstTopic).toBeVisible();
  const topicName = (await firstTopic.innerText()).trim();
  await firstTopic.click();

  // The list stays open on select, so it is dismissed first: the remaining
  // copy of the label is then the chip for the chosen topic, which is what
  // shows the selection actually registered rather than silently missing.
  await page.keyboard.press('Escape');
  await expect(topics.getByText(topicName, { exact: true })).toBeVisible();

  await page.getByTestId('funding-goal-input').fill('1000');

  await page.getByTestId('cover-image-input').setInputFiles({
    name: 'smoke-cover.png',
    mimeType: 'image/png',
    buffer: COVER_IMAGE,
  });
  await expect(page.getByRole('button', { name: 'Remove cover image' })).toBeVisible();

  await page.getByTestId('publishing-form-submit').click();

  // The dialog opens carrying the template's heading, which is too short to
  // publish. Asserting the blocked state first means the title field is
  // covered as a requirement rather than just as a step.
  const titleField = page.getByTestId('confirm-publish-title');
  await expect(titleField).toBeVisible();
  await expect(page.getByText('Title must be at least 20 characters long')).toBeVisible();
  await expect(page.getByTestId('confirm-publish-submit')).toBeDisabled();

  await titleField.fill(title);
  await page.getByLabel('I have adhered to the ResearchHub posting guidelines').check();

  const published = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/researchhubpost/' &&
      response.request().method() === 'POST'
  );
  await page.getByTestId('confirm-publish-submit').click();
  const response = await published;

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

  await openNotebookEditor(page);

  // Nothing is filled in: opening an existing proposal repopulates the form
  // from the published post, so it already satisfies the schema. A validation
  // error here means the publish above wrote a proposal the form will not
  // accept back, not that editing is broken.
  await page.getByTestId('notebook-add-details').click();
  await page.getByTestId('publishing-form-submit').click();

  // The dialog distinguishes a republish from a first publish, which is the
  // cheapest available proof the form knows it is editing rather than creating
  // a second proposal.
  await expect(page.getByRole('heading', { name: 'Confirm Re-publication' })).toBeVisible();

  const titleField = page.getByTestId('confirm-publish-title');
  await expect(titleField).toBeVisible();
  await titleField.fill(title);
  await page.getByLabel('I have adhered to the ResearchHub posting guidelines').check();

  const republished = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/researchhubpost/' &&
      response.request().method() === 'POST'
  );
  await page.getByTestId('confirm-publish-submit').click();
  const response = await republished;

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
