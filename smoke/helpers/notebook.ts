import { expect, type Page } from '@playwright/test';

/** The notebook editor, as `/notebook/<org slug>/<note id>`. */
const NOTEBOOK_NOTE = /\/notebook\/[^/]+\/\d+/;

/**
 * Opens the notebook note behind a published grant or proposal, by way of the
 * Edit action in the work header.
 *
 * Neither has an edit route of its own: Edit sends the author back to the note
 * the work was published from, and every change lands through a republish from
 * there. Editing the heading in the notebook alone would only move the draft's
 * title — the published one comes from that round trip.
 *
 * The click is retried as a unit because the action renders well before the app
 * can serve it. `handleEdit` needs the signed-in user's organisation, and
 * `OrganizationContext` only has one after the session resolves and a further
 * request comes back — several seconds into a page's life. Until then the click
 * produces an "Unable to edit" toast and nothing else, and because a grant
 * offers Edit to any author, contact or moderator without consulting that
 * state, nothing on the page marks the moment it becomes usable. There is no
 * readiness to wait on, so this waits on the outcome instead.
 *
 * Each attempt reopens the menu: a click on Edit closes it whether or not it
 * navigated.
 */
export async function openNotebookEditor(page: Page) {
  await expect(async () => {
    // `.first()` picks the work header's menu over any other on the page; the
    // header renders above the sidebar, so document order is enough to
    // distinguish them.
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.waitForURL(NOTEBOOK_NOTE, { timeout: 10_000 });
  }).toPass({ timeout: 120_000 });
}
