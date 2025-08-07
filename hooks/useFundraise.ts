'use client';

import { useState } from 'react';
import { FundraiseService } from '@/services/fundraise.service';
import { Fundraise } from '@/types/funding';
import { ApiError } from '@/services/types';
import { ID } from '@/types/root';
import AnalyticsService from '@/services/analytics.service';

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

export const useCreateContribution = (): UseCreateContributionReturn => {
  const [data, setData] = useState<Fundraise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContribution = async (id: ID, payload: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await FundraiseService.createContribution(id, payload);
      setData(response);

      // Track funding analytics
      try {
        const amount = payload.amount;
        const currency = payload.amount_currency || 'RSC';

        await AnalyticsService.logUserFunded('fundraise', id?.toString() || '', amount, currency, {
          fundraise_id: id,
          currency: currency,
          amount_currency: payload.amount_currency,
        });
      } catch (analyticsError) {
        // Don't fail the contribution if analytics fails
        console.error('Analytics error:', analyticsError);
      }
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
