import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { Fundraise } from '@/types/funding';

interface ContributionState {
  data: Fundraise | null;
  isLoading: boolean;
  error: string | null;
}

type CreateContributionFn = (id: number, payload: any, onSuccess?: () => void) => Promise<void>;
type UseCreateContributionReturn = [ContributionState, CreateContributionFn];

export function useCreateContribution(): UseCreateContributionReturn {
  const [state, setState] = useState<ContributionState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createContribution = async (id: number, payload: any) => {
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
