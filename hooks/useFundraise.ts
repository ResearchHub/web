import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import type { CreateContributionPayload, FundraiseResponse } from '@/services/types/fundraise.dto';

interface ContributionState {
  data: FundraiseResponse | null;
  isLoading: boolean;
  error: Error | null;
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
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to create contribution'),
        isLoading: false,
      }));
    }
  };

  return [state, createContribution];
}
