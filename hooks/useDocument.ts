'use client';
import { useState } from 'react';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ID } from '@/types/root';
import { ApiError } from '@/services/types';

export interface PreregistrationFormData {
  // Funding related
  budget: string;
  rewardFunders: boolean;
  nftArt: File | null;
  nftSupply: string;

  // Document related
  title: string;
  noteId: ID;
  renderable_text: string;
}

interface UsePostState {
  data: Work | null;
  isLoading: boolean;
  error: string | null;
}

type CreatePostFn = (formData: PreregistrationFormData) => Promise<Work>;
type UseCreatePostReturn = [UsePostState, CreatePostFn];

export const useCreatePost = (): UseCreatePostReturn => {
  const [data, setData] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreregistrationPost = async (formData: PreregistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSubmit = new FormData();

      formDataToSubmit.append('document_type', 'PREREGISTRATION');
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('renderable_text', formData.renderable_text);
      formDataToSubmit.append('full_src', formData.renderable_text);
      formDataToSubmit.append('note_id', String(formData.noteId ?? ''));
      formDataToSubmit.append('reward_funders', String(formData.rewardFunders));
      formDataToSubmit.append('nft_supply', String(formData.nftSupply));
      formDataToSubmit.append('fundraise_goal_currency', 'USD');
      formDataToSubmit.append(
        'fundraise_goal_amount',
        String(parseFloat(formData.budget.replace(/[^0-9.]/g, '')))
      );
      if (formData.nftArt) {
        formDataToSubmit.append('nft_art', formData.nftArt);
      }

      const response = await PostService.post({ formData: formDataToSubmit });
      setData(response);

      return response;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.msg || 'An error occurred while creating the preregistration post';
      setError(errorMsg);

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createPreregistrationPost];
};
