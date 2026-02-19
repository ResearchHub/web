'use client';

import { useState, useEffect, useCallback } from 'react';
import { FeedService } from '@/services/feed.service';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

export interface UserGrant {
  postId: number;
  title: string;
  slug: string;
  status: 'OPEN' | 'CLOSED';
  organization?: string;
}

function toUserGrant(entry: FeedEntry): UserGrant | null {
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

export function useUserGrants(userId: number | undefined) {
  const [grants, setGrants] = useState<UserGrant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrants = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { entries } = await FeedService.getFeed({
        endpoint: 'grant_feed',
        createdBy: userId,
        pageSize: 50,
      });
      setGrants(entries.map(toUserGrant).filter((g): g is UserGrant => g !== null));
    } catch (err) {
      console.error('Failed to fetch user grants:', err);
      setError('Failed to load RFPs.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  return { grants, isLoading, error, refetch: fetchGrants };
}
