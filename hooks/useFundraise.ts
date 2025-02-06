'use client';

import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { Fundraise } from '@/types/funding';
import { ApiError } from '@/services/types';

interface UseFundraiseState {
  data: Fundraise | null;
  isLoading: boolean;
  error: string | null;
}

type CreateContributionFn = (id: number, payload: any) => Promise<void>;
type UseCreateContributionReturn = [UseFundraiseState, CreateContributionFn];

export const useCreateContribution = (): UseCreateContributionReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContribution = async (id: number, payload: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.createContribution(id, payload);
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to create contribution';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createContribution];
};
