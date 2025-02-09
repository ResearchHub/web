'use client';

import { useState } from 'react';
import { VoteService } from '@/services/vote.service';
import { Vote } from '@/types/vote';
import { ApiError } from '@/services/types';
import type { VoteOptions } from '@/services/vote.service';

interface UseVoteState {
  data: Vote | null;
  isLoading: boolean;
  error: string | null;
}

type VoteFn = (params: VoteOptions) => Promise<void>;
type UseVoteReturn = [UseVoteState, VoteFn];

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
