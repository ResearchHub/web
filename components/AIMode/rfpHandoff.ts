import type { SelectedGrantDetails } from '@/types/grant';
import type { RfpGuide } from './rfpGuide';

/**
 * An RFP page's Apply hands the RFP it was on to the workspace, so the start
 * screen can show it picked without asking the server for it again, and,
 * from a landing page that has one, what the RFP expects from a proposal.
 * Kept for the tab's session, so a reload of the start screen still has it.
 */
const KEY_PREFIX = 'workspace:rfp:';
const GUIDE_KEY_PREFIX = 'workspace:rfp-guide:';

export function handOffRfp(grant: SelectedGrantDetails, guide?: RfpGuide): void {
  try {
    window.sessionStorage.setItem(KEY_PREFIX + grant.id, JSON.stringify(grant));
    if (guide) {
      window.sessionStorage.setItem(GUIDE_KEY_PREFIX + grant.id, JSON.stringify(guide));
    } else {
      window.sessionStorage.removeItem(GUIDE_KEY_PREFIX + grant.id);
    }
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

/** The guide handed over with that RFP, if its page had one. */
export function readHandedOffRfpGuide(grantId: string): RfpGuide | null {
  try {
    const stored = window.sessionStorage.getItem(GUIDE_KEY_PREFIX + grantId);
    if (!stored) return null;
    const guide = JSON.parse(stored) as RfpGuide;
    return guide?.starter && Array.isArray(guide.include) ? guide : null;
  } catch {
    return null;
  }
}
