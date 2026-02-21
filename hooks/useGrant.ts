'use client';

import { useState, useEffect } from 'react';
import { GrantService } from '@/services/grant.service';
import { GrantForModal } from '@/types/grant';
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

interface UseUserGrantsReturn {
  grants: GrantForModal[];
  isLoading: boolean;
}

export const useUserGrants = (userId?: number): UseUserGrantsReturn => {
  const [grants, setGrants] = useState<GrantForModal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchGrants = async () => {
      try {
        const results = await GrantService.getGrantsByUser(userId);
        setGrants(results);
      } catch (err) {
        console.error('Failed to fetch grants:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrants();
  }, [userId]);

  return { grants, isLoading };
};
