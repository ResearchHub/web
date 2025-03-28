'use client';
import { useState } from 'react';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ID } from '@/types/root';
import { TransformedWork } from '@/types/work';
import { ApiError } from '@/services/types';

export interface PreregistrationPostParams {
  // Funding related
  budget: string;
  rewardFunders: boolean;
  nftSupply: string;
  topics: string[];

  // Document related
  articleType: 'PREREGISTRATION' | 'DISCUSSION';
  title: string;
  noteId: ID;
  renderableText: string;
  fullJSON: string;
  fullSrc: string;
  assignDOI?: boolean;
  authors: number[];
}

interface UsePostState {
  data: TransformedWork | null;
  isLoading: boolean;
  error: string | null;
}

export interface UpsertPostResult extends TransformedWork {
  rawResponse?: any;
  fundraiseId?: ID;
}

type UpsertPostFn = (
  postParams: PreregistrationPostParams,
  postId?: ID
) => Promise<UpsertPostResult>;
type UseUpsertPostReturn = [UsePostState, UpsertPostFn];

export const useUpsertPost = (): UseUpsertPostReturn => {
  const [data, setData] = useState<TransformedWork | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertPost = async (
    postParams: PreregistrationPostParams,
    postId?: ID
  ): Promise<UpsertPostResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create the request payload
      const payload: any = {
        document_type: postParams.articleType,
        title: postParams.title,
        renderable_text: postParams.renderableText,
        full_src: postParams.fullSrc,
        full_json: postParams.fullJSON,
        note_id: postParams.noteId,
        assign_doi: postParams.assignDOI ?? false,
        hubs: postParams.topics,
        authors: postParams.authors,
      };

      if (postId) {
        payload.post_id = postId;
      } else if (postParams.articleType === 'PREREGISTRATION') {
        // Only include fundraise fields for creation
        payload.reward_funders = postParams.rewardFunders;
        payload.nft_supply = postParams.nftSupply;
        payload.fundraise_goal_currency = 'USD';
        payload.fundraise_goal_amount = parseFloat(postParams.budget.replace(/[^0-9.]/g, ''));
      }

      const response = (await PostService.upsert(payload)) as TransformedWork;

      // Extract fundraise ID from raw response if available
      const fundraiseId = response.raw?.fundraise?.id;

      // Set the transformed work as data
      setData(response);

      // Return an enhanced work object with the raw response and fundraise ID
      return {
        ...response,
        rawResponse: response.raw,
        fundraiseId,
      };
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
