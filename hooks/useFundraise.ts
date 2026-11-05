'use client';

import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { Fundraise } from '@/types/funding';
import { ApiError } from '@/services/types';
import { ID } from '@/types/root';

interface UseFundraiseState {
  data: Fundraise | null;
  isLoading: boolean;
  error: string | null;
}

type CloseFundraiseFn = (id: ID) => Promise<void>;
type UseCloseFundraiseReturn = [UseFundraiseState, CloseFundraiseFn];

type CompleteFundraiseFn = (id: ID) => Promise<void>;
type UseCompleteFundraiseReturn = [UseFundraiseState, CompleteFundraiseFn];

type ReopenFundraiseFn = (id: ID, durationDays: number) => Promise<void>;
type UseReopenFundraiseReturn = [UseFundraiseState, ReopenFundraiseFn];

export const useCloseFundraise = (): UseCloseFundraiseReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeFundraise = async (id: ID) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.closeFundraise(id);
      setData(response);
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Failed to close fundraise';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, closeFundraise];
};

export const useCompleteFundraise = (): UseCompleteFundraiseReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeFundraise = async (id: ID) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.completeFundraise(id);
      setData(response);
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Failed to complete fundraise';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, completeFundraise];
};

export const useReopenFundraise = (): UseReopenFundraiseReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reopenFundraise = async (id: ID, durationDays: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.reopenFundraise(id, durationDays);
      setData(response);
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Failed to reopen fundraise';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, reopenFundraise];
};
