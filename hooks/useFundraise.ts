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
  const [state, setState] = useState<UseFundraiseState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createContribution = async (id: number, payload: any) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await FundraiseService.createContribution(id, payload);
      setState((prev) => ({ ...prev, data: response, isLoading: false }));
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to create contribution';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));

      throw err;
    }
  };

  return [state, createContribution];
};
