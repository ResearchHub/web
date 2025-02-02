import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import type { CreateContributionPayload, FundraiseResponse } from '@/services/types/fundraise.dto';
import { ApiError } from '@/services/types';

interface ContributionState {
  data: FundraiseResponse | null;
  isLoading: boolean;
  error: string | null;
}

type CreateContributionFn = (id: number, payload: CreateContributionPayload) => Promise<void>;
type UseCreateContributionReturn = [ContributionState, CreateContributionFn];

export function useCreateContribution(): UseCreateContributionReturn {
  const [state, setState] = useState<ContributionState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createContribution = async (id: number, payload: CreateContributionPayload) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await FundraiseService.createContribution(id, payload);
      setState((prev) => ({ ...prev, data: response, isLoading: false }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message,
        isLoading: false,
      }));
    }
  };

  return [state, createContribution];
}
