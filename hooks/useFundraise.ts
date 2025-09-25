'use client';

import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { Fundraise } from '@/types/funding';
import { ApiError } from '@/services/types';
import { Currency, ID } from '@/types/root';
import { ContentType } from '@/types/work';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { useUser } from '@/contexts/UserContext';

interface UseFundraiseState {
  data: Fundraise | null;
  isLoading: boolean;
  error: string | null;
}

type CreateContributionFn = (id: ID, payload: any) => Promise<void>;
type UseCreateContributionReturn = [UseFundraiseState, CreateContributionFn];

type CloseFundraiseFn = (id: ID) => Promise<void>;
type UseCloseFundraiseReturn = [UseFundraiseState, CloseFundraiseFn];

type CompleteFundraiseFn = (id: ID) => Promise<void>;
type UseCompleteFundraiseReturn = [UseFundraiseState, CompleteFundraiseFn];

type CreateContributionPayload = {
  amount: number;
  amount_currency: Currency;
  work_id: string;
  content_type: ContentType;
};

export const useCreateContribution = (): UseCreateContributionReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const createContribution = async (id: ID, payload: CreateContributionPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.createContribution(id, payload);
      AnalyticsService.logEventWithUserProperties(
        LogEvent.PROPOSAL_FUNDED,
        {
          fundraise_id: id,
          work_id: payload.work_id,
          content_type: payload.content_type,
        },
        user
      );
      setData(response);
    } catch (err) {
      const { data = {} } = err instanceof ApiError ? JSON.parse(err.message) : {};
      const errorMsg = data?.message || 'Failed to create contribution';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ data, isLoading, error }, createContribution];
};

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
