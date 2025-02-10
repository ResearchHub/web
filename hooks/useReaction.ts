'use client';

import { useState, useEffect } from 'react';
import { ReactionService } from '@/services/reaction.service';
import { Vote } from '@/types/reaction';
import { ApiError } from '@/services/types';
import type { VoteOptions, FlagOptions } from '@/services/reaction.service';

interface UseVoteState {
  data: Vote | null;
  isLoading: boolean;
  error: string | null;
}

type VoteFn = (params: VoteOptions) => Promise<void>;
type UseVoteReturn = [UseVoteState, VoteFn];

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
      const response = await ReactionService.vote(params);
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

interface UseFlagState {
  isLoading: boolean;
  error: string | null;
}

type FlagFn = (params: FlagOptions) => Promise<void>;
type UseFlagReturn = [UseFlagState, FlagFn];

export const useFlag = (): UseFlagReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flag = async (params: FlagOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      await ReactionService.flag(params);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to flag content';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, flag];
};
