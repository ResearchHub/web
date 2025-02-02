import { useState } from 'react';
import { PostService } from '@/services/post.service';
import { Post } from '@/types/post';
import { FormData as FundingFormData } from '@/app/fund/create/page';

interface PreregistrationState {
  data: Post | null;
  isLoading: boolean;
  error: string | null;
}

type CreatePreregistrationPostFn = (formData: FundingFormData) => Promise<Post>;
type UsePreregistrationReturn = [PreregistrationState, CreatePreregistrationPostFn];

export function usePreregistrationPost(): UsePreregistrationReturn {
  const [state, setState] = useState<PreregistrationState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createPreregistrationPost = async (formData: FundingFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formDataToSubmit = new FormData();

      formDataToSubmit.append('document_type', 'PREREGISTRATION');
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('renderable_text', formData.background);
      formDataToSubmit.append('full_src', formData.background);
      formDataToSubmit.append('hypothesis', formData.hypothesis);
      formDataToSubmit.append('methods', formData.methods);
      formDataToSubmit.append('budget_use', formData.budgetUse);
      formDataToSubmit.append('reward_funders', String(formData.rewardFunders));
      formDataToSubmit.append('nft_supply', formData.nftSupply);
      formDataToSubmit.append('fundraise_goal_currency', 'USD');
      formDataToSubmit.append(
        'fundraise_goal_amount',
        String(parseFloat(formData.budget.replace(/[^0-9.]/g, '')))
      );
      if (formData.nftArt) {
        formDataToSubmit.append('nft_art', formData.nftArt);
      }

      const response = await PostService.post(formDataToSubmit);
      setState((prev) => ({ ...prev, data: response, isLoading: false }));
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while creating the preregistration';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw err;
    }
  };

  return [state, createPreregistrationPost];
}
