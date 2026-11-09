import { expect, type Locator, type Page } from '@playwright/test';

/** A document open in the workspace, as `/workspace?note=<note id>`. */
const WORKSPACE_NOTE = /\/workspace\?note=\d+/;

/**
 * A 64×64 PNG, inline rather than a committed binary, since an RFP or
 * proposal cannot be published without a cover.
 */
const COVER_IMAGE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAUElEQVR42u3PQQkAAAgEsOufzLchzGEE' +
    '38JgBZbqeS0CAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApcF3mo' +
    'CWVPTG70AAAAASUVORK5CYII=',
  'base64'
);

/**
 * Creates an empty draft from the workspace's start screen, without the
 * assistant. The button stays disabled until the user's organisation has
 * loaded, which the click waits out. Only once the note exists does the URL
 * carry its id, so waiting for that is what confirms the draft was created;
 * it has its own timeout because it is by far the slowest step.
 */
export async function startBlankDraft(page: Page) {
  await page.getByRole('button', { name: 'Start with a blank page' }).click();
  await page.waitForURL(WORKSPACE_NOTE, { timeout: 120_000 });
}

/**
 * Picks a cover from the document's header. Done before the publish dialog
 * opens, because the dialog generates one with AI for a draft that has none.
 */
export async function addCover(page: Page) {
  await page.getByTestId('masthead-cover-input').setInputFiles({
    name: 'smoke-cover.png',
    mimeType: 'image/png',
    buffer: COVER_IMAGE,
  });
  await expect(page.getByRole('button', { name: 'Change the cover image' })).toBeVisible();
}

export async function openPublishDialog(page: Page) {
  await page.getByTestId('workspace-publish').click();
  const dialog = page.getByTestId('workspace-publish-dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * Gives a detail in the publish dialog a value: the row named `row` opens its
 * editor, the field labelled `field` takes the value, and Enter saves it.
 */
export async function fillDetail(dialog: Locator, row: string, field: string, value: string) {
  await dialog.getByRole('button', { name: new RegExp(`^${row}`) }).click();
  const input = dialog.getByLabel(field, { exact: true });
  await input.fill(value);
  await input.press('Enter');
  await expect(input).toBeHidden();
}

/**
 * Agrees to the guidelines and publishes, returning the upsert response.
 * Asserting nothing is still missing first means a detail the form wants but
 * the test did not give reports as that, rather than as a disabled button.
 */
export async function confirmPublish(page: Page, dialog: Locator) {
  await expect(dialog.getByTestId('workspace-publish-missing')).toBeHidden();
  await dialog.getByLabel('I have adhered to the ResearchHub').check();

  const published = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/researchhubpost/' &&
      response.request().method() === 'POST'
  );
  await dialog.getByTestId('workspace-publish-confirm').click();
  return published;
}

/**
 * Opens the workspace document behind a published grant or proposal, by way
 * of the Edit action in the work header.
 *
 * Neither has an edit route of its own: Edit sends the author back to the
 * document the work was published from, and every change lands through a
 * republish from there.
 *
 * The click is retried as a unit because the action renders well before the app
 * can serve it. `handleEdit` needs the signed-in user's organisation, and
 * `OrganizationContext` only has one after the session resolves and a further
 * request comes back — several seconds into a page's life. Until then the click
 * produces an "Unable to edit" toast and nothing else, and nothing on the page
 * marks the moment it becomes usable. There is no readiness to wait on, so this
 * waits on the outcome instead.
 *
 * Each attempt reopens the menu: a click on Edit closes it whether or not it
 * navigated.
 */
export async function openWorkspaceEditor(page: Page) {
  await expect(async () => {
    // `.first()` picks the work header's menu over any other on the page; the
    // header renders above the sidebar, so document order is enough to
    // distinguish them.
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.waitForURL(WORKSPACE_NOTE, { timeout: 10_000 });
  }).toPass({ timeout: 120_000 });
}
