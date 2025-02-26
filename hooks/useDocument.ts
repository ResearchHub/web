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
  topics: string[];

  // Document related
  title: string;
  noteId: ID;
  renderableText: string;
  fullJSON: string;
  fullSrc: string;
  assignDOI?: boolean;
}

interface UsePostState {
  data: Work | null;
  isLoading: boolean;
  error: string | null;
}

type UpsertPostFn = (formData: PreregistrationFormData, postId?: ID) => Promise<Work>;
type UseUpsertPostReturn = [UsePostState, UpsertPostFn];

export const useUpsertPost = (): UseUpsertPostReturn => {
  const [data, setData] = useState<Work | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertPost = async (formData: PreregistrationFormData, postId?: ID) => {
    setIsLoading(true);
    setError(null);

    try {
      const formDataToSubmit = new FormData();

      if (postId) {
        formDataToSubmit.append('post_id', String(postId));
      }
      formDataToSubmit.append('document_type', 'PREREGISTRATION');
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('renderable_text', formData.renderableText);
      formDataToSubmit.append('full_src', formData.fullSrc);
      formDataToSubmit.append('full_json', formData.fullJSON);
      formDataToSubmit.append('note_id', String(formData.noteId ?? ''));
      formDataToSubmit.append('assign_doi', String(formData.assignDOI ?? false));

      // Extract topic IDs and append them individually
      formData.topics.forEach((topic) => {
        formDataToSubmit.append('hubs', topic);
      });

      // Only append fundraise-related fields for creation
      if (!postId) {
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
      }

      const response = await PostService.post({ formData: formDataToSubmit });

      setData(response);
      return response;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.msg || 'An error occurred while saving the preregistration post';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, upsertPost];
};
