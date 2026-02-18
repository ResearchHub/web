'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeedService } from '@/services/feed.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

export interface UserRFP {
  postId: number;
  title: string;
  slug: string;
  status: 'OPEN' | 'CLOSED';
  organization?: string;
}

function toUserRFP(entry: FeedEntry): UserRFP | null {
  if (entry.contentType !== 'GRANT') return null;
  const grant = entry.content as FeedGrantContent;
  return {
    postId: grant.id,
    title: grant.title,
    slug: grant.slug,
    status: grant.grant.status,
    organization: grant.organization,
  };
}

export function useUserRFPs(userId: number | undefined) {
  const [rfps, setRfps] = useState<UserRFP[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRFPs = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { entries } = await FeedService.getFeed({
        endpoint: 'grant_feed',
        createdBy: userId,
        pageSize: 50,
      });
      setRfps(entries.map(toUserRFP).filter((r): r is UserRFP => r !== null));
    } catch (err) {
      console.error('Failed to fetch user RFPs:', err);
      setError('Failed to load RFPs.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRFPs();
  }, [fetchRFPs]);

  return { rfps, isLoading, error, refetch: fetchRFPs };
}
