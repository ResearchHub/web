'use client';

import { useEffect, useState } from 'react';
import { FeedService } from '@/services/feed.service';
import type { FeedEntry } from '@/types/feed';

interface OpenFundingLists {
  /** Proposals raising money right now. */
  proposals: FeedEntry[];
  /** RFPs taking proposals right now. */
  rfps: FeedEntry[];
}

export interface OpenFunding extends OpenFundingLists {
  /** True until the lists have answered for the first time. */
  isLoading: boolean;
}

/** How long a fetched answer is reused before it is refreshed in the background. */
const FRESH_MS = 5 * 60 * 1000;

/**
 * The last answer per list size, kept for the browser tab's lifetime, so a page
 * that mounts again after a client-side navigation (going back home from a
 * work page) shows the lists at once instead of a skeleton. Only written in an
 * effect, so it never fills on the server.
 */
const cache = new Map<number, { lists: OpenFundingLists; fetchedAt: number }>();

async function fetchOpenFunding(limit: number): Promise<OpenFundingLists> {
  const sample = (load: Promise<{ entries: FeedEntry[] }>) =>
    load.then((result) => result.entries.slice(0, limit)).catch(() => []);
  const [proposals, rfps] = await Promise.all([
    sample(
      FeedService.getFeed({
        endpoint: 'funding_feed',
        contentType: 'PREREGISTRATION',
        fundraiseStatus: 'OPEN',
        pageSize: limit,
      })
    ),
    sample(
      FeedService.getFeed({
        endpoint: 'grant_feed',
        contentType: 'GRANT',
        status: 'OPEN',
        pageSize: limit,
      })
    ),
  ]);
  return { proposals, rfps };
}

/**
 * The first few proposals raising now and RFPs taking proposals, from the same
 * feeds the Proposals and RFPs tabs read. A list that fails to load comes back
 * empty. Nothing is fetched while `enabled` is false, for a caller that is not
 * on screen.
 */
export function useOpenFunding(limit: number, { enabled = true } = {}): OpenFunding {
  const [lists, setLists] = useState(() => cache.get(limit)?.lists ?? null);

  useEffect(() => {
    if (!enabled) return;
    const cached = cache.get(limit);
    if (cached && Date.now() - cached.fetchedAt < FRESH_MS) {
      setLists(cached.lists);
      return;
    }

    let cancelled = false;
    fetchOpenFunding(limit).then((next) => {
      // Two empty lists usually mean the requests failed; try again next time.
      if (next.proposals.length > 0 || next.rfps.length > 0) {
        cache.set(limit, { lists: next, fetchedAt: Date.now() });
      }
      if (!cancelled) setLists(next);
    });
    return () => {
      cancelled = true;
    };
  }, [limit, enabled]);

  return {
    proposals: lists?.proposals ?? [],
    rfps: lists?.rfps ?? [],
    isLoading: lists === null,
  };
}
