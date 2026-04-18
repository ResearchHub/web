'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

const DEFAULT_POLL_INTERVAL_MS = 3000;
const DEFAULT_MAX_POLL_FAILURES = 3;

interface UseProposalReviewPollingOptions {
  intervalMs?: number;
  enabled?: boolean;
  maxConsecutiveFailures?: number;
}

interface UseProposalReviewPollingState {
  review: ProposalReview | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
}

interface UseProposalReviewPollingControls {
  start: () => void;
  stop: () => void;
  refetch: () => Promise<void>;
}

type UseProposalReviewPollingReturn = [
  UseProposalReviewPollingState,
  UseProposalReviewPollingControls,
];

/**
 * Polls GET proposal-review until status is completed or failed.
 */
export function useProposalReviewPolling(
  reviewId: number | string | null,
  options?: UseProposalReviewPollingOptions
): UseProposalReviewPollingReturn {
  const intervalMs = options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const enabled = options?.enabled !== false;
  const maxConsecutiveFailures = options?.maxConsecutiveFailures ?? DEFAULT_MAX_POLL_FAILURES;

  const [review, setReview] = useState<ProposalReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollPaused, setPollPaused] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const failuresRef = useRef(0);

  const clearPollInterval = useCallback(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const loadOnce = useCallback(async (): Promise<ProposalReview | null> => {
    if (reviewId == null) return null;
    const detail = await AiPeerReviewService.getProposalReview(reviewId);
    setReview(detail);
    return detail;
  }, [reviewId]);

  const refetch = useCallback(async () => {
    if (reviewId == null) return;
    try {
      setIsLoading(true);
      setError(null);
      failuresRef.current = 0;
      await loadOnce();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch proposal review';
      setError(message);
      setReview(null);
    } finally {
      setIsLoading(false);
    }
  }, [reviewId, loadOnce]);

  useEffect(() => {
    if (reviewId == null || !enabled) {
      setReview(null);
      setError(null);
      clearPollInterval();
      return;
    }

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      failuresRef.current = 0;
      try {
        const detail = await AiPeerReviewService.getProposalReview(reviewId);
        if (!cancelled) setReview(detail);
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch proposal review';
          setError(message);
          setReview(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reviewId, enabled, clearPollInterval]);

  useEffect(() => {
    if (reviewId == null || !enabled || pollPaused) {
      clearPollInterval();
      return;
    }

    const status = review?.status;
    if (status !== 'pending' && status !== 'processing') {
      clearPollInterval();
      return;
    }

    setIsPolling(true);
    intervalRef.current = setInterval(() => {
      void (async () => {
        try {
          const detail = await AiPeerReviewService.getProposalReview(reviewId);
          failuresRef.current = 0;
          setReview(detail);
          setError(null);
          if (detail.status === 'completed' || detail.status === 'failed') {
            clearPollInterval();
          }
        } catch (err: unknown) {
          failuresRef.current += 1;
          const message = err instanceof Error ? err.message : 'Failed to poll proposal review';
          setError(message);
          if (failuresRef.current >= maxConsecutiveFailures) {
            clearPollInterval();
          }
        }
      })();
    }, intervalMs);

    return () => {
      clearPollInterval();
    };
  }, [
    reviewId,
    enabled,
    pollPaused,
    review?.status,
    intervalMs,
    maxConsecutiveFailures,
    clearPollInterval,
  ]);

  const stop = useCallback(() => {
    setPollPaused(true);
    clearPollInterval();
  }, [clearPollInterval]);

  const start = useCallback(() => {
    setPollPaused(false);
    failuresRef.current = 0;
  }, []);

  const noopRefetch = useCallback(async () => {}, []);
  const noopStart = useCallback(() => {}, []);
  const noopStop = useCallback(() => {}, []);

  const effectiveReview = reviewId == null ? null : review;
  const effectiveLoading = reviewId == null ? false : isLoading;
  const effectivePolling = reviewId == null ? false : isPolling;
  const effectiveError = reviewId == null ? null : error;

  return [
    {
      review: effectiveReview,
      isLoading: effectiveLoading,
      isPolling: effectivePolling,
      error: effectiveError,
    },
    {
      start: reviewId == null ? noopStart : start,
      stop: reviewId == null ? noopStop : stop,
      refetch: reviewId == null ? noopRefetch : refetch,
    },
  ];
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
