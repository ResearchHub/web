import { resolveCampaign, type PoolCampaign } from './campaign';

export interface PoolAuthor {
  name: string;
  headline: string;
  avatarUrl: string | null;
}

export interface PoolProposal {
  id: number;
  /** Fundraise a pooled contribution targets. Distinct from the work id above. */
  fundraiseId: number;
  slug: string;
  title: string;
  imageUrl: string | null;
  authors: PoolAuthor[];
  reviewCount: number;
  avgScore: number | null;
  nonprofitName: string | null;
  status: string;
  raisedUsd: number;
  goalUsd: number;
  contributors: number;
}

interface RawAuthor {
  first_name?: string;
  last_name?: string;
  headline?: string | null;
  profile_image?: string | null;
}

interface RawFundingFeedEntry {
  nonprofit?: { id?: number; name?: string } | null;
  content_object?: {
    id?: number;
    slug?: string;
    title?: string;
    image_url?: string | null;
    authors?: RawAuthor[];
    reviews?: { score?: number }[];
    fundraise?: {
      id?: number;
      status?: string;
      goal_amount?: { usd?: number };
      amount_raised?: { usd?: number };
      contributors?: { total?: number };
    } | null;
  };
}

/** next/image only permits the hosts declared in next.config.js remotePatterns. */
const ALLOWED_IMAGE_HOSTS = new Set([
  'storage.prod.researchhub.com',
  'storage.staging.researchhub.com',
  'storage.dev.researchhub.com',
  'lh3.googleusercontent.com',
  'pbs.twimg.com',
  'images.unsplash.com',
]);

function safeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return ALLOWED_IMAGE_HOSTS.has(new URL(url).hostname) ? url : null;
  } catch {
    return null;
  }
}

function transformEntry(entry: RawFundingFeedEntry): PoolProposal | null {
  const work = entry.content_object;
  if (!work?.id || !work.title || !work.fundraise?.id) return null;

  const reviews = Array.isArray(work.reviews) ? work.reviews : [];
  const scores = reviews.map((r) => r.score).filter((s): s is number => typeof s === 'number');

  return {
    id: work.id,
    fundraiseId: work.fundraise.id,
    slug: work.slug ?? '',
    title: work.title,
    imageUrl: safeImageUrl(work.image_url),
    authors: (work.authors ?? [])
      .map((a) => ({
        name: `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim(),
        headline: a.headline ?? '',
        avatarUrl: safeImageUrl(a.profile_image),
      }))
      .filter((a) => a.name.length > 0),
    reviewCount: reviews.length,
    avgScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : null,
    nonprofitName: entry.nonprofit?.name ?? null,
    status: work.fundraise.status ?? 'CLOSED',
    raisedUsd: work.fundraise.amount_raised?.usd ?? 0,
    goalUsd: work.fundraise.goal_amount?.usd ?? 0,
    contributors: work.fundraise.contributors?.total ?? 0,
  };
}

/**
 * A campaign's pool, in the order `allowedFundraiseIds` declares.
 *
 * Fully funded proposals are kept: the pool visibly filling up is the point.
 * They're excluded from contribution targeting downstream, where remaining need
 * drops to zero.
 *
 * A campaign with no source for the active environment gets an empty pool
 * rather than whatever unrelated preregistrations that backend happens to hold.
 * To work on a campaign locally with real content, point `ENV_ACTIVE` at the
 * environment that owns its data — the cards render and funding stays disabled
 * unless the origin guard is satisfied.
 */
export async function getPoolProposals(campaign: PoolCampaign): Promise<PoolProposal[]> {
  const { source, feedUrl } = resolveCampaign(campaign);
  if (!source || !feedUrl) return [];

  try {
    const res = await fetch(feedUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results: RawFundingFeedEntry[] = Array.isArray(data?.results) ? data.results : [];

    const byFundraiseId = new Map<number, PoolProposal>();
    for (const entry of results) {
      const proposal = transformEntry(entry);
      if (proposal) byFundraiseId.set(proposal.fundraiseId, proposal);
    }

    const found = source.allowedFundraiseIds
      .map((id) => byFundraiseId.get(id))
      .filter((p): p is PoolProposal => p !== undefined);

    warnOnUnresolvedIds(campaign, source.allowedFundraiseIds, byFundraiseId);

    return found;
  } catch {
    return [];
  }
}

/**
 * An allowlisted id that isn't in the feed renders one fewer card with no other
 * signal, and the usual cause is a post id pasted where a fundraise id belongs.
 * Naming the misses — and what was available — turns that into a one-line fix.
 */
function warnOnUnresolvedIds(
  campaign: PoolCampaign,
  allowedFundraiseIds: number[],
  byFundraiseId: Map<number, PoolProposal>
) {
  if (process.env.NODE_ENV === 'production') return;

  const missing = allowedFundraiseIds.filter((id) => !byFundraiseId.has(id));
  if (missing.length === 0) return;

  const available = [...byFundraiseId.values()]
    .map((p) => `${p.fundraiseId} (post ${p.id}: ${p.title.slice(0, 40)})`)
    .join('\n    ');

  console.warn(
    `[pool:${campaign.slug}] allowedFundraiseIds not found in the grant feed: ${missing.join(', ')}\n` +
      `  These must be fundraise ids, not post ids. Available in this grant:\n    ${available}`
  );
}
