import {
  ACTIVE_API_ORIGIN,
  ALLOW_MISMATCHED_ORIGIN,
  ENV_ACTIVE,
  normalizeOrigin,
  type PoolEnv,
} from './env';

/**
 * Where one environment's pool comes from.
 *
 * `grantId` is required because there's no anonymous way to read a fundraise by
 * id — `/api/fundraise/{id}/` needs auth — so the only server-renderable source
 * is a grant's funding feed, filtered down to the allowlist.
 */
export interface PoolSource {
  grantId: number;
  /**
   * The pool, in display order: both what the campaign renders and the set a
   * pooled contribution can land on. The two must not diverge — funding a
   * proposal the visitor never saw undercuts the premise.
   *
   * These are fundraise ids (`content_object.fundraise.id` in the feed), not
   * the post ids that appear in funding page URLs.
   */
  allowedFundraiseIds: number[];
}

export interface PoolCampaign {
  slug: string;
  /** Heading shown on the contribution modal, e.g. "The Substation Fund". */
  fundLabel: string;
  /** What one pooled item is called in copy. */
  unit: { singular: string; plural: string };
  /** Where CTAs point when the pool isn't fundable in the active environment. */
  fallbackUrl: string;
  /** A null environment means this campaign has no pool there. */
  environments: Record<PoolEnv, PoolSource | null>;
}

export interface ResolvedPool {
  apiOrigin: string;
  source: PoolSource | null;
  /**
   * Whether contributions may be routed at the campaign's fundraise IDs.
   * When false, every CTA falls back to `fallbackUrl`, where proposals can
   * still be funded individually.
   */
  isFundable: boolean;
  /** Null when the campaign has no source in the active environment. */
  feedUrl: string | null;
}

export function resolveCampaign(campaign: PoolCampaign): ResolvedPool {
  const source = campaign.environments[ENV_ACTIVE];

  if (!source || source.allowedFundraiseIds.length === 0) {
    return { apiOrigin: ACTIVE_API_ORIGIN, source: null, isFundable: false, feedUrl: null };
  }

  const originMatches =
    normalizeOrigin(ACTIVE_API_ORIGIN) === normalizeOrigin(process.env.NEXT_PUBLIC_API_URL);

  return {
    apiOrigin: ACTIVE_API_ORIGIN,
    source,
    isFundable: ALLOW_MISMATCHED_ORIGIN || originMatches,
    // Always the active env's host, so the cards on screen describe the same
    // fundraises a contribution can reach.
    feedUrl:
      `${ACTIVE_API_ORIGIN}/api/funding_feed/` +
      `?page=1&page_size=100&content_type=PREREGISTRATION` +
      `&grant_id=${source.grantId}&ordering=best`,
  };
}
