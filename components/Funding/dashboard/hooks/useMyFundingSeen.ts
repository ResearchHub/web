'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * What the user had already seen when they last left My Funding, kept in the
 * browser: nothing about it needs to follow them to another device, and the
 * API has nowhere to keep it.
 */
const activityKey = (userId: number) => `my-funding:activity-seen:${userId}`;
const proposalsKey = (userId: number) => `my-funding:proposals-seen:${userId}`;

/** RFP post id → the ids of the proposals already seen on it. */
type SeenProposals = Record<string, number[]>;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private windows and full storage just lose the "new" markers.
  }
}

export interface MyFundingSeen {
  /**
   * When the user last opened the Activity tab, as it stood when the page
   * loaded: it stays put for the whole visit so the "new" markers do too.
   * Null on a first visit, when nothing counts as new.
   */
  readonly activitySeenAt: number | null;
  /** Remember that the activity up to now has been seen. */
  readonly markActivitySeen: () => void;
  /**
   * How many of an RFP's proposals arrived since the user last looked at it.
   * An RFP never looked at before has none: its proposals become the baseline.
   */
  readonly newProposalCount: (rfpPostId: number, proposalIds: readonly number[]) => number;
  /** Remember an RFP's proposals as seen, when the user goes to review them. */
  readonly markProposalsSeen: (rfpPostId: number, proposalIds: readonly number[]) => void;
  /** Store the proposals of RFPs never looked at before, so later ones count as new. */
  readonly setProposalBaselines: (
    rfps: readonly { postId: number; proposalIds: readonly number[] }[]
  ) => void;
}

export function useMyFundingSeen(userId: number | undefined, enabled: boolean): MyFundingSeen {
  const [activitySeenAt, setActivitySeenAt] = useState<number | null>(null);
  const [seenProposals, setSeenProposals] = useState<SeenProposals | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;
    const storedActivity = read<number>(activityKey(userId));
    setActivitySeenAt(storedActivity);
    // A first visit starts the clock, so the next one has something to compare.
    if (storedActivity == null) write(activityKey(userId), Date.now());
    setSeenProposals(read<SeenProposals>(proposalsKey(userId)) ?? {});
  }, [userId, enabled]);

  const markActivitySeen = useCallback(() => {
    if (userId && enabled) write(activityKey(userId), Date.now());
  }, [userId, enabled]);

  const newProposalCount = useCallback(
    (rfpPostId: number, proposalIds: readonly number[]) => {
      const seen = seenProposals?.[rfpPostId];
      if (!seen) return 0;
      const seenIds = new Set(seen);
      return proposalIds.filter((id) => !seenIds.has(id)).length;
    },
    [seenProposals]
  );

  const markProposalsSeen = useCallback(
    (rfpPostId: number, proposalIds: readonly number[]) => {
      if (!userId || !enabled) return;
      const next = { ...(read<SeenProposals>(proposalsKey(userId)) ?? {}) };
      next[rfpPostId] = [...proposalIds];
      write(proposalsKey(userId), next);
    },
    [userId, enabled]
  );

  const setProposalBaselines = useCallback(
    (rfps: readonly { postId: number; proposalIds: readonly number[] }[]) => {
      if (!userId || !enabled) return;
      const stored = read<SeenProposals>(proposalsKey(userId)) ?? {};
      const missing = rfps.filter((rfp) => !stored[rfp.postId]);
      if (missing.length === 0) return;
      for (const rfp of missing) stored[rfp.postId] = [...rfp.proposalIds];
      write(proposalsKey(userId), stored);
    },
    [userId, enabled]
  );

  return useMemo(
    () => ({
      activitySeenAt,
      markActivitySeen,
      newProposalCount,
      markProposalsSeen,
      setProposalBaselines,
    }),
    [activitySeenAt, markActivitySeen, newProposalCount, markProposalsSeen, setProposalBaselines]
  );
}
