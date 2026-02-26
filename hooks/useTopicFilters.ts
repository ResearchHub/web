'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFollowContext } from '@/contexts/FollowContext';
import { HubService } from '@/services/hub.service';
import { Topic } from '@/types/topic';

export function useTopicFilters() {
  const { followedTopics } = useFollowContext();
  const [primaryTopics, setPrimaryTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    HubService.getPrimaryHubs()
      .then((hubs) => {
        if (!cancelled) setPrimaryTopics(hubs);
      })
      .catch((err) => console.error('Error fetching primary hubs:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = useMemo(() => {
    const followedIds = new Set(followedTopics.map((t) => t.id));
    const deduped = primaryTopics.filter((t) => !followedIds.has(t.id));
    return [...followedTopics, ...deduped];
  }, [followedTopics, primaryTopics]);

  return { topics, isLoading };
}
