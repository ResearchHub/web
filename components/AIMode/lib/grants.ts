import { GRANT, RFP_SECTIONS } from './grantData';
import { createId } from './ids';
import { ORG_PROFILE } from './orgProfile';
import type { GrantRecord, JudgmentPolicy, OrgProfile } from './types';

/**
 * The org's standing defaults, which is what the judgment document opens on.
 * Delegated by default: this run is meant to show AI-managed disbursement, so
 * the delegated path is what the funder confirms rather than what he has to
 * remember to click.
 */
export const DEFAULT_JUDGMENT: JudgmentPolicy = {
  mode: 'ai',
  minReviewScore: 3.5,
  maxPerProposalUsd: 300_000,
  totalBudgetUsd: GRANT.amountUsd,
  notifyBeforeDisbursing: true,
};

/** A program at the moment the assistant starts reading the case file. */
export const createGrant = (): GrantRecord => ({
  id: createId('grant'),
  orgId: ORG_PROFILE.id,
  title: GRANT.title,
  amountUsd: GRANT.amountUsd,
  rfp: { revealedSections: [], status: 'drafting' },
  judgment: { policy: { ...DEFAULT_JUDGMENT }, confirmed: false },
  fundedAmountUsd: null,
  updatedAt: Date.now(),
});

/**
 * A program that has already been drafted, funded and published, for when the
 * funder opens "Get updates" without having run the RFP track first. The
 * updates thread has to report on something.
 */
export const createPublishedGrant = (): GrantRecord => ({
  ...createGrant(),
  rfp: { revealedSections: RFP_SECTIONS.map((section) => section.id), status: 'published' },
  judgment: { policy: { ...DEFAULT_JUDGMENT }, confirmed: true },
  fundedAmountUsd: GRANT.amountUsd,
});

/** One org in the demo; a real surface would look this up by `orgId`. */
export const getOrgProfile = (orgId: string): OrgProfile => {
  void orgId;
  return ORG_PROFILE;
};
