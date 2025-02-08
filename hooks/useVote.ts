'use client';

import { useState, useCallback, useEffect } from 'react';
import { VoteService } from '@/services/vote.service';
import { Vote } from '@/types/vote';
import { ApiError } from '@/services/types';
import type { VoteOptions, GetVotesOptions } from '@/services/vote.service';

interface UseVoteState {
  data: Vote | null;
  isLoading: boolean;
  error: string | null;
}

interface UseUserVotesState {
  data: {
    papers: Record<string, Vote>;
    posts: Record<string, Vote>;
  } | null;
  isLoading: boolean;
  error: string | null;
}

type VoteFn = (params: VoteOptions) => Promise<void>;
type GetVotesFn = (options: GetVotesOptions) => Promise<void>;
type UseVoteReturn = [UseVoteState, VoteFn];
type UseUserVotesReturn = [UseUserVotesState, GetVotesFn];

interface UseUserVotesOptions {
  paperIds?: (string | number)[];
  postIds?: (string | number)[];
}

export const useVote = (): UseVoteReturn => {
  const [data, setData] = useState<Vote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (params: VoteOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await VoteService.vote(params);
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to vote';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, vote];
};

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
      const response = await VoteService.getVotes({
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
