'use client';

import { useEffect, useState } from 'react';
import { FeedService } from '@/services/feed.service';
import type { FeedEntry } from '@/types/feed';

export interface OpenFunding {
  /** Proposals raising money right now. */
  proposals: FeedEntry[];
  /** RFPs taking proposals right now. */
  rfps: FeedEntry[];
  /** True until both lists have answered, whether or not they succeeded. */
  isLoading: boolean;
}

/**
 * The first few proposals raising now and RFPs taking proposals, from the same
 * feeds the Proposals and RFPs tabs read. A list that fails to load comes back
 * empty.
 */
export function useOpenFunding(limit: number): OpenFunding {
  const [proposals, setProposals] = useState<FeedEntry[]>([]);
  const [rfps, setRfps] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const sample = (load: Promise<{ entries: FeedEntry[] }>, set: (entries: FeedEntry[]) => void) =>
      load
        .then((result) => !cancelled && set(result.entries.slice(0, limit)))
        .catch(() => undefined);
    Promise.all([
      sample(
        FeedService.getFeed({
          endpoint: 'funding_feed',
          contentType: 'PREREGISTRATION',
          fundraiseStatus: 'OPEN',
          pageSize: limit,
        }),
        setProposals
      ),
      sample(
        FeedService.getFeed({
          endpoint: 'grant_feed',
          contentType: 'GRANT',
          status: 'OPEN',
          pageSize: limit,
        }),
        setRfps
      ),
    ]).then(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { proposals, rfps, isLoading };
}
