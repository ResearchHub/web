'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AiPeerReviewService,
  type CreateProposalReviewPayload,
  type RfpBriefRefreshPayload,
} from '@/services/aiPeerReview.service';
import type {
  ExecutiveSummaryResponse,
  GrantComparisonResponse,
  ProposalReview,
  RfpSummary,
  RfpSummaryMissing,
} from '@/types/aiPeerReview';
import { isRfpSummaryMissing } from '@/types/aiPeerReview';

// ── useProposalReview ─────────────────────────────────────────────────────────

interface UseProposalReviewState {
  review: ProposalReview | null;
  isLoading: boolean;
  error: string | null;
}

type RefetchProposalReviewFn = () => Promise<void>;
type UseProposalReviewReturn = [UseProposalReviewState, RefetchProposalReviewFn];

/**
 * Fetches a single AI proposal review by id (no polling).
 */
export function useProposalReview(reviewId: number | string | null): UseProposalReviewReturn {
  const [review, setReview] = useState<ProposalReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (reviewId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const detail = await AiPeerReviewService.getProposalReview(reviewId);
      setReview(detail);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch proposal review';
      setError(message);
      setReview(null);
    } finally {
      setIsLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (reviewId != null) {
      void fetch();
    } else {
      setReview(null);
      setError(null);
    }
  }, [reviewId, fetch]);

  return [{ review, isLoading, error }, fetch];
}

// ── useCreateProposalReview ───────────────────────────────────────────────────

interface UseCreateProposalReviewState {
  review: ProposalReview | null;
  isLoading: boolean;
  error: string | null;
}

type CreateProposalReviewFn = (payload: CreateProposalReviewPayload) => Promise<ProposalReview>;
type UseCreateProposalReviewReturn = [UseCreateProposalReviewState, CreateProposalReviewFn];

export function useCreateProposalReview(): UseCreateProposalReviewReturn {
  const [review, setReview] = useState<ProposalReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = useCallback(async (payload: CreateProposalReviewPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AiPeerReviewService.createProposalReview(payload);
      setReview(response);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create proposal review';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ review, isLoading, error }, createReview];
}

// ── useGrantComparison ────────────────────────────────────────────────────────

interface UseGrantComparisonState {
  data: GrantComparisonResponse | null;
  isLoading: boolean;
  error: string | null;
}

type RefetchGrantComparisonFn = () => Promise<void>;
type UseGrantComparisonReturn = [UseGrantComparisonState, RefetchGrantComparisonFn];

export function useGrantComparison(grantId: number | string | null): UseGrantComparisonReturn {
  const [data, setData] = useState<GrantComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (grantId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await AiPeerReviewService.getGrantComparison(grantId);
      setData(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch grant comparison';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [grantId]);

  useEffect(() => {
    if (grantId != null) {
      void fetch();
    } else {
      setData(null);
      setError(null);
    }
  }, [grantId, fetch]);

  return [{ data, isLoading, error }, fetch];
}

// ── useRfpSummary ─────────────────────────────────────────────────────────────

interface UseRfpSummaryState {
  summary: RfpSummary | RfpSummaryMissing | null;
  isLoading: boolean;
  error: string | null;
  /** True when API returned the 404 "no row yet" envelope (see `isRfpSummaryMissing`). */
  isMissing: boolean;
}

type RefetchRfpSummaryFn = () => Promise<void>;
type UseRfpSummaryReturn = [UseRfpSummaryState, RefetchRfpSummaryFn];

export function useRfpSummary(grantId: number | string | null): UseRfpSummaryReturn {
  const [summary, setSummary] = useState<RfpSummary | RfpSummaryMissing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (grantId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await AiPeerReviewService.getRfpSummary(grantId);
      setSummary(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch RFP summary';
      setError(message);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [grantId]);

  useEffect(() => {
    if (grantId != null) {
      void fetch();
    } else {
      setSummary(null);
      setError(null);
    }
  }, [grantId, fetch]);

  const isMissing = summary != null && isRfpSummaryMissing(summary);

  return [{ summary, isLoading, error, isMissing }, fetch];
}

// ── useRefreshRfpSummary ──────────────────────────────────────────────────────

interface UseRefreshRfpSummaryState {
  summary: RfpSummary | null;
  isLoading: boolean;
  error: string | null;
}

type RefreshRfpSummaryFn = (
  grantId: number | string,
  payload?: RfpBriefRefreshPayload
) => Promise<RfpSummary>;

type UseRefreshRfpSummaryReturn = [UseRefreshRfpSummaryState, RefreshRfpSummaryFn];

export function useRefreshRfpSummary(): UseRefreshRfpSummaryReturn {
  const [summary, setSummary] = useState<RfpSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (gid: number | string, payload?: RfpBriefRefreshPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AiPeerReviewService.refreshRfpSummary(gid, payload);
      setSummary(response);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to refresh RFP summary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ summary, isLoading, error }, refresh];
}

// ── useGenerateExecutiveSummary ───────────────────────────────────────────────

interface UseGenerateExecutiveSummaryState {
  result: ExecutiveSummaryResponse | null;
  isLoading: boolean;
  error: string | null;
}

type GenerateExecutiveSummaryFn = (grantId: number | string) => Promise<ExecutiveSummaryResponse>;
type UseGenerateExecutiveSummaryReturn = [
  UseGenerateExecutiveSummaryState,
  GenerateExecutiveSummaryFn,
];

export function useGenerateExecutiveSummary(): UseGenerateExecutiveSummaryReturn {
  const [result, setResult] = useState<ExecutiveSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (grantId: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AiPeerReviewService.generateExecutiveSummary(grantId);
      setResult(response);
      return response;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate executive comparison summary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [{ result, isLoading, error }, generate];
}
