import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { logIn } from './helpers/auth';
import { grantId } from './helpers/fixtures';

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
  await page.goto(`/grant/${grantId()}`);

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
  await page.getByTestId('apply-draft-new').click();
  await page.getByTestId('apply-continue').click();

  // /notebook resolves the user's organisation, the org page creates the note
  // from the proposal template, and only then does the URL carry a note id.
  // Waiting for that id is what confirms the draft exists — and it is the
  // point from which this test has something to clean up. Given its own
  // timeout because it is by far the slowest step, so a hang here reports as
  // itself rather than as the whole test running out of budget.
  await page.waitForURL(/\/notebook\/[^/]+\/\d+/, { timeout: 120_000 });

  await page.getByTestId('notebook-add-details').click();

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
  // grant was attached, not which one: SMOKE_GRANT_ID is the post id the URL
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
  const proposalUrl = new URL(page.url());
  proposalUrl.searchParams.delete('new');
  await page.goto(proposalUrl.toString());

  // The title lands on the page twice as an h1: once in the header, from the
  // post record the API returned, and once in the document body, from the
  // editor content. Either proves the publish, but the body one mounts a beat
  // later — matching both is a race that only shows up on a slower run.
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
});
