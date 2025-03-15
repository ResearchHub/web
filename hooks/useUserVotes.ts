'use client';

import { useState, useEffect } from 'react';
import { ReactionService } from '@/services/reaction.service';
import { Vote } from '@/types/reaction';
import { ApiError } from '@/services/types';

interface UseUserVotesOptions {
  paperIds?: (string | number)[];
  postIds?: (string | number)[];
}

/**
 * Hook to fetch user votes for papers and posts
 */
export const useUserVotes = ({ paperIds, postIds }: UseUserVotesOptions) => {
  const [data, setData] = useState<{
    papers: Record<string, Vote>;
    posts: Record<string, Vote>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = async () => {
    if (!paperIds?.length && !postIds?.length) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ReactionService.getVotes({
        paperIds: paperIds || [],
        postIds: postIds || [],
      });
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to fetch votes';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [paperIds?.join(','), postIds?.join(',')]);

  return { data, isLoading, error, refresh: fetchVotes };
};
