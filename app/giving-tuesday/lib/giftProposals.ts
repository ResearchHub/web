import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import { transformFeedEntry, type FeedPostContent, type RawApiFeedEntry } from '@/types/feed';
import type { Fundraise } from '@/types/funding';
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
 * most first and the ones that can't take a gift last. A proposal missing from
 * the open feed, completed or not loaded, keeps its listing without a fundraise.
 */
export async function fetchGiftProposals(): Promise<GiftProposal[]> {
  const fundraises = await fetchOpenFundraises();
  return (giftProposalEntries as Omit<GiftProposal, 'fundraise'>[])
    .map((entry) => ({ ...entry, fundraise: fundraises.get(entry.id) }))
    .sort((a, b) => getNeededUsd(b) - getNeededUsd(a));
}

/** Every open fundraise, by post id. The post endpoint leaves the fundraise out. */
async function fetchOpenFundraises() {
  const fundraises = new Map<number, Fundraise>();
  let url: string | null =
    `${ACTIVE_API_ORIGIN}/api/funding_feed/?fundraise_status=OPEN&page_size=100`;

  try {
    while (url) {
      const res: Response = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!res.ok) break;
      const data: { results: RawApiFeedEntry[]; next: string | null } = await res.json();
      for (const entry of data.results) {
        const { id, fundraise } = transformFeedEntry(entry).content as FeedPostContent;
        if (fundraise) fundraises.set(id, fundraise);
      }
      url = data.next;
    }
  } catch (error) {
    console.error('Failed to load Giving Tuesday fundraises:', error);
  }
  return fundraises;
}
