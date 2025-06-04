'use client';

import { useState } from 'react';
import { GrantService } from '@/services/grant.service';
import { ApiError } from '@/services/types';

interface CreateGrantPayload {
  amount: string;
  currency: string;
  organization: string;
  description: string;
  postId: number;
}

interface UseGrantState {
  data: any | null;
  isLoading: boolean;
  error: string | null;
}

type CreateGrantFn = (payload: CreateGrantPayload) => Promise<void>;
type UseCreateGrantReturn = [UseGrantState, CreateGrantFn];

export const useCreateGrant = (): UseCreateGrantReturn => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGrant = async (params: CreateGrantPayload) => {
    setIsLoading(true);
    setError(null);

    // Create the request payload
    const payload: any = {
      ...params,
      post_id: params.postId,
    };

    try {
      const response = await GrantService.createGrant(payload);
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to create grant';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createGrant];
};
