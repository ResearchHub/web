import { randomUUID } from 'node:crypto';
import { expect, test, type Locator, type Page, type Request } from '@playwright/test';
import { logIn } from './helpers/auth';
import { proposalPostId } from './helpers/fixtures';

/**
 * Comments are exercised against the fixture proposal rather than a paper.
 * It is content the smoke account owns, so the editor and the Edit action are
 * reachable without borrowing someone else's post.
 *
 * The tradeoff is that a proposal renders its conversation through
 * FundDocument, which overrides the editor's draft key to
 * `rh-comments-comment-feed-<id>` instead of the CommentFeed default. Same
 * behaviour either way — only the key differs — but a regression confined to
 * the paper/post branch would not be caught here.
 */

/**
 * A sort change refetches immediately, so this is capped well below the test
 * timeout: a dead control then reports in seconds rather than eating the whole
 * budget, twice over once CI retries.
 */
const SORT_CHANGE_TIMEOUT = 15_000;

/**
 * Comment ordering never reaches the URL, so the request the feed builds is
 * the only place the chosen sort is observable. Matched on the path suffix
 * rather than the full path because the document segment depends on how the
 * content type maps to an API route (`researchhubpost` here, `paper`
 * elsewhere), and none of that is what this is checking.
 */
function commentsRequest(ordering: string) {
  return (request: Request) => {
    const url = new URL(request.url());
    return url.pathname.endsWith('/comments/') && url.searchParams.get('ordering') === ordering;
  };
}

/** Matches the create endpoint, which is shared by top-level comments and replies. */
function isCommentCreate(url: string) {
  return new URL(url).pathname.endsWith('/comments/create_rh_comment/');
}

/** The TipTap surface inside a given editor. Typing has to go through the real
 * contenteditable: `fill` bypasses the input events ProseMirror listens for. */
function proseMirror(editor: Locator) {
  return editor.locator('.ProseMirror');
}

/**
 * Opens the fixture proposal's conversation.
 *
 * The tab strip is client state, not routing — WorkHeader wires it straight to
 * `setActiveTab` — so clicking a tab swaps the panel without touching the URL,
 * and a reload would land back on the default tab. The conversation does have
 * a real route, so resolving the canonical slug and navigating to it gives the
 * specs an address that survives the reload the draft test depends on.
 */
async function openConversation(page: Page) {
  await page.goto(`/proposal/${proposalPostId()}`);
  await page.waitForURL(/\/proposal\/\d+\/[^/?#]+/);

  const { pathname } = new URL(page.url());
  await page.goto(`${pathname.replace(/\/$/, '')}/conversation`);
}

/**
 * Drops any draft left in localStorage and reloads so the editor remounts
 * without it.
 *
 * Drafts outlive the test that wrote them: they have no expiry, and the store
 * is keyed by user and document, so every spec here shares one. Without this,
 * a draft test that failed before cleaning up would prepend its text to the
 * comment the next test posts, and the failure would surface in the wrong
 * place. Clearing on the way in rather than the way out is what makes that
 * true even when the previous test crashed.
 */
async function clearDrafts(page: Page) {
  await page.evaluate(() => window.localStorage.removeItem('comment_drafts'));
  await page.reload();
}

/** Waits for the feed to resolve into either a populated list or the empty state. */
function settledFeed(page: Page) {
  return page.getByTestId('comment-list').or(page.getByTestId('comment-empty-state'));
}

/**
 * Writes a top-level comment through the editor and returns the new id.
 *
 * The id comes from the response rather than from assuming the comment is
 * first in the list. It is prepended today, but that is a reducer detail, and
 * an id gives callers a locator that cannot drift onto a neighbour.
 */
async function postComment(page: Page, body: string): Promise<number> {
  await page.getByTestId('comment-editor-collapsed').click();

  // `.first()` distinguishes the feed's own composer, which renders above the
  // list, from any editor opened inline on a comment further down.
  const composer = page.getByTestId('comment-editor').first();
  await proseMirror(composer).click();
  await proseMirror(composer).pressSequentially(body);

  const posted = page.waitForResponse(
    (response) => isCommentCreate(response.url()) && response.request().method() === 'POST'
  );
  await composer.getByTestId('comment-editor-submit').click();
  const response = await posted;
  expect(response.ok()).toBe(true);

  return (await response.json()).id;
}

/**
 * Guarantees the conversation holds at least one comment, writing one if it
 * does not.
 *
 * Deployed environments carry no comments at all — every post and paper
 * sampled on staging returns a count of zero, the fixture proposal included —
 * so a spec that simply assumed one would fail outright on a fresh
 * environment. Pinning a hand-seeded document instead would only move the
 * problem to the next database refresh. Seeding through the UI keeps the suite
 * self-sufficient, and because comments are never cleaned up it is a no-op on
 * every run after the first.
 */
async function ensureComment(page: Page) {
  await expect(settledFeed(page)).toBeVisible();

  if (await page.getByTestId('comment-empty-state').isVisible()) {
    await postComment(page, `Smoke test seed comment, please ignore ${randomUUID().slice(0, 8)}`);
  }
}

test('the conversation tab lists comments', async ({ page }) => {
  // Logged in because an empty conversation has to be seeded before it can be
  // listed, and the editor is only offered to a signed-in user.
  test.setTimeout(120_000);

  await logIn(page);
  await page.goto(`/proposal/${proposalPostId()}`);

  // The tab is the feature under test here, so this clicks it rather than
  // navigating to /conversation directly. Its accessible name carries the
  // comment count after the word, hence the prefix match.
  await page
    .getByRole('button', { name: /^Conversation/ })
    .first()
    .click();

  await ensureComment(page);

  await expect(page.getByTestId('comment-list')).toBeVisible();
  await expect(page.getByTestId('comment-item').first()).toBeVisible();

  // A failed fetch renders the empty state rather than an error, so the list
  // being populated is only half the assertion: without this, a broken feed
  // that happened to leave one stale item mounted would still pass.
  await expect(page.getByTestId('comment-empty-state')).toHaveCount(0);
});

test('a comment draft is restored after a reload', async ({ page }) => {
  test.setTimeout(120_000);

  await logIn(page);
  await openConversation(page);
  await clearDrafts(page);

  const draft = `Smoke test draft, please ignore ${randomUUID().slice(0, 8)}`;

  await page.getByTestId('comment-editor-collapsed').click();
  const editor = page.getByTestId('comment-editor').first();
  await proseMirror(editor).click();
  await proseMirror(editor).pressSequentially(draft);

  // The write is debounced by 1.5s, and the footer is the only place the user
  // is told it happened. Waiting on it rather than on a fixed sleep is also
  // what stops the reload below racing the save.
  await expect(page.getByTestId('comment-draft-status')).toHaveText(/Draft saved/);

  await page.reload();

  // Restoring a draft auto-expands the editor, so a user who comes back finds
  // their text in front of them rather than behind a collapsed prompt. Both
  // halves matter: the text alone would pass even if it were hidden.
  await expect(page.getByTestId('comment-editor-collapsed')).toHaveCount(0);
  await expect(proseMirror(page.getByTestId('comment-editor').first())).toContainText(draft);
});

test('the conversation can be sorted', async ({ page }) => {
  test.setTimeout(120_000);

  await logIn(page);

  const initialBest = page.waitForRequest(commentsRequest('BEST'));
  await openConversation(page);
  await initialBest;

  // Not just a readability nicety: the feed skips the refetch entirely while
  // it holds no comments, so changing sort on an empty conversation would
  // assert nothing and time out somewhere less obvious.
  await ensureComment(page);
  await expect(page.getByTestId('comment-item').first()).toBeVisible();

  // The feed defaults to Best, so picking Newest is already a real change of
  // order and needs no round trip through a second option to mean something.
  const byNewest = page.waitForRequest(commentsRequest('CREATED_DATE'), {
    timeout: SORT_CHANGE_TIMEOUT,
  });
  await page.getByTestId('comment-sort-trigger').click();

  // The menu is portalled to the body by Radix, so the option cannot be
  // scoped to the control that opened it.
  await page.getByTestId('comment-sort-option-CREATED_DATE').click();
  await byNewest;

  await expect(page.getByTestId('comment-item').first()).toBeVisible();
});

/**
 * Posting, editing and replying run as one test against one comment.
 *
 * Comments are not cleaned up — `censor` exists, but leaving the thread as a
 * user would leave it keeps this consistent with `proposal.spec.ts` — so each
 * independent test would add another comment to the fixture proposal on every
 * run. Chaining costs isolation and buys a third of the litter, and it is also
 * the order a real thread happens in.
 */
test('a comment can be posted, then edited, then replied to', async ({ page }) => {
  // Three round trips through Django on top of a login and two navigations.
  test.setTimeout(180_000);

  await logIn(page);
  await openConversation(page);
  await clearDrafts(page);
  await expect(settledFeed(page)).toBeVisible();

  const body = `Smoke test comment, please ignore ${randomUUID().slice(0, 8)}`;
  const commentId = await postComment(page, body);

  const comment = page.locator(`#comment-${commentId}`);
  await expect(comment).toContainText(body);

  // Edit. The action bar is addressed by test id rather than by role:
  // FeedItemComment renders it inside an aria-hidden wrapper, so none of its
  // controls exist as far as an accessible-name lookup is concerned. The menu
  // it opens is portalled to the body, which puts the item back in the tree
  // but also out of the comment, so that one cannot be scoped to it.
  const edited = `Smoke test comment, edited, please ignore ${randomUUID().slice(0, 8)}`;

  await comment.getByTestId('feed-item-more-options').first().click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  const editor = comment.getByTestId('comment-editor').first();
  await expect(proseMirror(editor)).toContainText(body);

  // Selecting all first, rather than appending: a click lands the caret
  // wherever it happened to hit, which makes the resulting text unpredictable.
  await proseMirror(editor).click();
  await page.keyboard.press('ControlOrMeta+a');
  await proseMirror(editor).pressSequentially(edited);

  const updated = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname.endsWith(`/comments/${commentId}/`) &&
      response.request().method() === 'PATCH'
  );
  await editor.getByTestId('comment-editor-submit').click();
  expect((await updated).ok()).toBe(true);

  // The edit is applied optimistically and only then overwritten by the
  // response, so this could pass a moment before the server has agreed.
  // Awaiting the PATCH above is what makes it an assertion about the saved
  // comment rather than about the guess the reducer rendered.
  await expect(comment).toContainText(edited);
  await expect(comment).not.toContainText(body);

  // Reply.
  const replyBody = `Smoke test reply, please ignore ${randomUUID().slice(0, 8)}`;

  // Same bar, same reason. `.first()` keeps this on the comment's own control
  // rather than one belonging to a reply nested underneath it.
  await comment.getByTestId('feed-item-comment-action').first().click();
  const replyEditor = comment.getByTestId('comment-reply-editor');
  await expect(replyEditor).toBeVisible();
  await proseMirror(replyEditor).click();
  await proseMirror(replyEditor).pressSequentially(replyBody);

  const replied = page.waitForResponse(
    (response) => isCommentCreate(response.url()) && response.request().method() === 'POST'
  );
  await replyEditor.getByTestId('comment-editor-submit').click();
  const repliedResponse = await replied;
  expect(repliedResponse.ok()).toBe(true);

  // Threading is the whole point of a reply, and the nesting below could be
  // produced by a flat insert that merely rendered in the right place, so the
  // parent link is asserted on the request as well.
  expect(repliedResponse.request().postDataJSON()).toMatchObject({ parent_id: commentId });

  const replyId = (await repliedResponse.json()).id;
  await expect(comment.locator(`#comment-${replyId}`)).toContainText(replyBody);
});
