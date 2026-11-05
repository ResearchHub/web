import type { SelectedGrantDetails } from '@/types/grant';

/**
 * An RFP page's Apply hands the RFP it was on to the workspace, so the start
 * screen can show it picked without asking the server for it again. Kept for
 * the tab's session, so a reload of the start screen still has it.
 */
const KEY_PREFIX = 'workspace:rfp:';

export function handOffRfp(grant: SelectedGrantDetails): void {
  try {
    window.sessionStorage.setItem(KEY_PREFIX + grant.id, JSON.stringify(grant));
  } catch {
    // Storage is unavailable: the start screen opens with no RFP picked.
  }
}

/** The RFP an Apply handed over under this id, if this tab has it. */
export function readHandedOffRfp(grantId: string): SelectedGrantDetails | null {
  try {
    const stored = window.sessionStorage.getItem(KEY_PREFIX + grantId);
    if (!stored) return null;
    const grant = JSON.parse(stored) as SelectedGrantDetails;
    return grant?.id === grantId && grant.shortTitle ? grant : null;
  } catch {
    return null;
  }
}
