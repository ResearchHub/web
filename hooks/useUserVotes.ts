'use client';

import { useState, useEffect } from 'react';
import { ReactionService } from '@/services/reaction.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { useUser } from '@/contexts/UserContext';
import { Vote } from '@/types/reaction';

interface UseUserVotesOptions {
  paperIds?: (string | number)[];
  postIds?: (string | number)[];
}

/**
 * Hook to fetch the signed-in user's votes for papers and posts.
 * Signed-out visitors have no votes (the endpoint answers 401), so nothing is requested for them.
 */
export const useUserVotes = ({ paperIds, postIds }: UseUserVotesOptions) => {
  const { user } = useUser();
  const [data, setData] = useState<{
    papers: Record<string, Vote>;
    posts: Record<string, Vote>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVotes = async () => {
    if (!user) return;
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
      setError(extractApiErrorMessage(err, 'Failed to fetch votes'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [user?.id, paperIds?.join(','), postIds?.join(',')]);

  return { data, isLoading, error, refresh: fetchVotes };
};
