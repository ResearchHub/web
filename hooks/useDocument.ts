'use client';
import { useState } from 'react';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ID } from '@/types/root';
import { TransformedWork } from '@/types/work';
import { ApiError } from '@/services/types';
import {
  PaperService,
  UpdatePaperMetadataPayload,
  UpdatePaperAbstractPayload,
} from '@/services/paper.service';

export interface PreregistrationPostParams {
  // Funding related
  budget: string;
  rewardFunders: boolean;
  nftSupply: string;
  topics: string[];

  // Document related
  articleType: 'PREREGISTRATION' | 'DISCUSSION' | 'GRANT';
  title: string;
  noteId: ID;
  renderableText: string;
  fullJSON: string;
  fullSrc: string;
  assignDOI?: boolean;
  authors: number[];
  image: string | null;

  // Grant specific
  applicationDeadline?: Date | null;
  organization?: string | null;
  description?: string | null;
  contacts?: number[];
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

      if (postParams.image) {
        payload.image = postParams.image;
      }

      if (postId) {
        payload.post_id = postId;
      } else if (postParams.articleType === 'PREREGISTRATION') {
        // Include fundraise fields for creation of proposals and grants
        payload.reward_funders = postParams.rewardFunders;
        payload.nft_supply = postParams.nftSupply;
        payload.fundraise_goal_currency = 'USD';
        payload.fundraise_goal_amount = parseFloat(postParams.budget.replace(/[^0-9.]/g, ''));
      }

      if (postParams.articleType === 'GRANT') {
        payload.grant_amount = parseFloat(postParams.budget.replace(/[^0-9.]/g, ''));
        payload.grant_currency = 'USD';
        payload.grant_organization = postParams.organization;
        payload.grant_description = postParams.description;
        payload.grant_end_date = postParams.applicationDeadline?.toISOString() || null;
        payload.grant_contacts = postParams.contacts;
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
      const errorMsg = data?.msg || 'An error occurred while saving the proposal post';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, upsertPost];
};

interface UseUpdateWorkMetadataState {
  isLoading: boolean;
  error: string | null;
}

type UpdateWorkMetadataFn = (workId: number, payload: UpdatePaperMetadataPayload) => Promise<Work>;

type UseUpdateWorkMetadataReturn = [UseUpdateWorkMetadataState, UpdateWorkMetadataFn];

export const useUpdateWorkMetadata = (): UseUpdateWorkMetadataReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkMetadata = async (
    workId: number,
    payload: UpdatePaperMetadataPayload
  ): Promise<Work> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedWork = await PaperService.updateMetadata(workId, payload);
      return updatedWork;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.msg || 'An error occurred while updating the work metadata';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, updateWorkMetadata];
};

interface UseUpdateWorkAbstractState {
  isLoading: boolean;
  error: string | null;
}

type UpdateWorkAbstractFn = (workId: number, payload: UpdatePaperAbstractPayload) => Promise<Work>;

type UseUpdateWorkAbstractReturn = [UseUpdateWorkAbstractState, UpdateWorkAbstractFn];

export const useUpdateWorkAbstract = (): UseUpdateWorkAbstractReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWorkAbstract = async (
    workId: number,
    payload: UpdatePaperAbstractPayload
  ): Promise<Work> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedWork = await PaperService.updateAbstract(workId, payload);
      return updatedWork;
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.msg || 'An error occurred while updating the work abstract';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, updateWorkAbstract];
};
