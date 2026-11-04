import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import type { Fundraise } from '@/types/funding';
import type { ID } from '@/types/root';

/** The grant creator is the only person who may pay an award proposal directly. */
export function isGrantCreator(
  userId: ID | null | undefined,
  grantCreatorUserId: ID | null | undefined
): boolean {
  return (
    userId != null && grantCreatorUserId != null && Number(userId) === Number(grantCreatorUserId)
  );
}

export function isAwardMechanism(mechanism?: string | null): boolean {
  return mechanism === 'AWARD';
}

/**
 * Awarded means the payout has finished and the fundraise is COMPLETED.
 * Money still in escrow is set aside, and is not an award yet.
 */
export type AwardPhase = 'none' | 'set-aside' | 'awarded';

export function getAwardPhase(
  fundraise?: {
    status?: string;
    amountRaised?: { usd?: number; rsc?: number };
  } | null
): AwardPhase {
  const raised = fundraise?.amountRaised;
  const hasAmount = (raised?.usd ?? 0) > 0 || (raised?.rsc ?? 0) > 0;
  if (!hasAmount) return 'none';
  return fundraise?.status === 'COMPLETED' ? 'awarded' : 'set-aside';
}

/** Award the first time. Award more once this proposal already has money. */
export function awardActionLabel(
  fundraise?: { status?: string; amountRaised?: { usd?: number; rsc?: number } } | null
): 'Award' | 'Award more' {
  return getAwardPhase(fundraise) === 'none' ? 'Award' : 'Award more';
}

/** The card label for money on an award proposal, once any has been committed. */
export function awardRaisedLabel(
  fundraise?: { status?: string; amountRaised?: { usd?: number; rsc?: number } } | null
): 'Awarded' | 'Set aside' | null {
  const phase = getAwardPhase(fundraise);
  if (phase === 'awarded') return 'Awarded';
  if (phase === 'set-aside') return 'Set aside';
  return null;
}

/**
 * The Award button: an award RFP that is still open, a fundraise still taking
 * money, and the grant creator. Moderators allocate from the pool instead.
 */
export function canAwardProposal(input: {
  userId: ID | null | undefined;
  grantCreatorUserId: ID | null | undefined;
  isAward: boolean;
  grantOpen: boolean;
  fundraise?: Fundraise | null;
}): boolean {
  return (
    input.isAward &&
    input.grantOpen &&
    isGrantCreator(input.userId, input.grantCreatorUserId) &&
    !!input.fundraise &&
    isFundraiseActive(input.fundraise)
  );
}
