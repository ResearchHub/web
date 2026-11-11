import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import type { Fundraise } from '@/types/funding';
import { transformPost } from '@/types/work';
import { ACTIVE_API_ORIGIN, ALLOW_MISMATCHED_ORIGIN, normalizeOrigin } from '@/app/pool/lib/env';
import type { CauseId } from '@/app/giving-tuesday/lib/causes';
import giftProposalEntries from '@/app/giving-tuesday/lib/giftProposals.json';

export interface GiftProposal {
  id: number;
  title: string;
  causeId: CauseId;
  summary: string;
  fundraise?: Fundraise;
}

/**
 * The ids in `giftProposals.json` are production posts, so every environment reads
 * them from `ACTIVE_API_ORIGIN`. A gift posts to `NEXT_PUBLIC_API_URL`, where the
 * same fundraise ids belong to unrelated fundraises unless the two match.
 */
export const IS_GIVING_ENABLED =
  ALLOW_MISMATCHED_ORIGIN ||
  normalizeOrigin(ACTIVE_API_ORIGIN) === normalizeOrigin(process.env.NEXT_PUBLIC_API_URL);

/** The API takes a gift to any open fundraise, even one that has met its goal. */
export function isGiftable(fundraise: Fundraise | undefined): fundraise is Fundraise {
  return (
    !!fundraise &&
    isFundraiseActive(fundraise) &&
    fundraise.amountRaised.usd < fundraise.goalAmount.usd
  );
}

/** What a proposal can still take, in USD. Zero once it can't take a gift. */
export function getNeededUsd({ fundraise }: GiftProposal): number {
  return isGiftable(fundraise) ? fundraise.goalAmount.usd - fundraise.amountRaised.usd : 0;
}

/**
 * The listed nonprofit proposals with their live fundraise, the ones needing the
 * most first and the ones that can't take a gift last. A proposal whose post
 * fails to load keeps its listing.
 */
export async function fetchGiftProposals(): Promise<GiftProposal[]> {
  const proposals = await Promise.all(
    (giftProposalEntries as Omit<GiftProposal, 'fundraise'>[]).map(async (entry) => ({
      ...entry,
      fundraise: (await fetchPost(entry.id))?.fundraise,
    }))
  );
  return proposals.sort((a, b) => getNeededUsd(b) - getNeededUsd(a));
}

async function fetchPost(id: number) {
  try {
    const res = await fetch(`${ACTIVE_API_ORIGIN}/api/researchhubpost/${id}/`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return undefined;
    return transformPost(await res.json());
  } catch (error) {
    console.error(`Failed to load Giving Tuesday proposal ${id}:`, error);
    return undefined;
  }
}
