'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseExpertSearchWsEvent, type ExpertSearchWsEvent } from '@/types/expertFinder';
import { ExpertFinderService, type SearchStatus } from '@/services/expertFinder.service';
import { WS_ROUTES } from '@/services/websocket';
import { useReconnectingSocket, type SocketStatus } from './useReconnectingSocket';

const FATAL_CLOSE_CODES: ReadonlySet<number> = new Set([4401, 4403, 4404]);

const appendBaselinesBySearchId = new Map<string, number>();

export function markExpertSearchAppendBaseline(searchId: number | string, baseline: number): void {
  appendBaselinesBySearchId.set(String(searchId), Math.max(0, Math.floor(baseline)));
}

export function clearExpertSearchAppendBaseline(searchId: number | string): void {
  appendBaselinesBySearchId.delete(String(searchId));
}

export function getExpertSearchAppendBaseline(searchId: number | string): number {
  return appendBaselinesBySearchId.get(String(searchId)) ?? 0;
}

export interface ExpertSearchProgressSeed {
  status?: SearchStatus | null;
  progress?: number;
  currentStep?: string;
}

interface UseExpertSearchProgressOptions {
  searchId: number | string | null;
  wsUrl?: string | null;
  enabled?: boolean;
  /**
   * Bump when starting a new live run on the same search (e.g. find-more) so progress
   * and the new-experts counter reset.
   */
  runKey?: number;
  expertsBaseline?: number;
  seed?: ExpertSearchProgressSeed;
  onTerminal?: (
    event: Extract<ExpertSearchWsEvent, { kind: 'search_finished' | 'search_failed' }>
  ) => void;
}

export interface UseExpertSearchProgressReturn {
  progress: number;
  currentStep: string;
  status: SearchStatus | null;
  /** Experts found in the current live run only (not prior append baseline). */
  expertsFound: number;
  error: string | null;
  isConnected: boolean;
  isTerminal: boolean;
  socketStatus: SocketStatus;
}

function toRunExpertsFound(reported: number, baseline: number, prevShown = 0): number {
  const n = Math.max(0, reported);
  if (baseline <= 0) return n;
  if (n > baseline) return n - baseline;
  if (n < baseline) return n;
  // n === baseline
  if (prevShown === baseline - 1 || prevShown === baseline) return n;
  return 0;
}

function resolveBaseline(searchId: number | string | null, expertsBaseline: number): number {
  if (expertsBaseline > 0) return expertsBaseline;
  if (searchId == null) return 0;
  return getExpertSearchAppendBaseline(searchId);
}

/**
 * Live expert-search progress over WebSocket (Token subprotocol).
 * Progress % comes from search_progress / terminal events; expert count from experts_found only.
 */
export function useExpertSearchProgress({
  searchId,
  wsUrl = null,
  enabled = true,
  runKey = 0,
  expertsBaseline = 0,
  seed,
  onTerminal,
}: UseExpertSearchProgressOptions): UseExpertSearchProgressReturn {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [expertsFound, setExpertsFound] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isTerminal, setIsTerminal] = useState(false);

  const onTerminalRef = useRef(onTerminal);
  onTerminalRef.current = onTerminal;
  const terminalHandledRef = useRef(false);
  // True after the first WS progress/terminal frame for this run — stop adopting REST seed.
  const wsProgressReceivedRef = useRef(false);
  const baseline = resolveBaseline(searchId, expertsBaseline);
  const expertsBaselineRef = useRef(baseline);
  expertsBaselineRef.current = baseline;

  const resolvedUrl = useMemo(() => {
    if (searchId == null) return null;
    const fromApi = wsUrl?.trim();
    if (fromApi) return fromApi;
    return WS_ROUTES.EXPERT_FINDER_SEARCH(searchId);
  }, [searchId, wsUrl]);

  const socketEnabled = enabled && searchId != null && !isTerminal && resolvedUrl != null;

  const applyDetailSnapshot = useCallback(async () => {
    if (searchId == null) return;
    try {
      const detail = await ExpertFinderService.getSearch(searchId);
      setStatus(detail.status);
      // Prefer REST progress until WS has sent a progress frame for this run.
      if (!wsProgressReceivedRef.current && typeof detail.progress === 'number') {
        setProgress((prev) => Math.max(prev, detail.progress));
      }
      if (detail.currentStep) {
        setCurrentStep((prev) =>
          wsProgressReceivedRef.current ? prev || detail.currentStep : detail.currentStep
        );
      }
      if (detail.errorMessage?.trim()) setError(detail.errorMessage.trim());
      if (detail.status === 'completed' || detail.status === 'failed') {
        setIsTerminal(true);
        if (searchId != null) clearExpertSearchAppendBaseline(searchId);
      }
    } catch {}
  }, [searchId]);

  const handleEvent = useCallback(
    (event: ExpertSearchWsEvent) => {
      if (event.kind === 'search_progress') {
        wsProgressReceivedRef.current = true;
        setStatus(event.status);
        setProgress(event.progress);
        if (event.currentStep) setCurrentStep(event.currentStep);
        return;
      }

      if (event.kind === 'experts_found') {
        setExpertsFound((prev) => {
          const next = toRunExpertsFound(event.expertCount, expertsBaselineRef.current, prev);
          return Math.max(prev, next);
        });
        return;
      }

      if (event.kind === 'search_finished' || event.kind === 'search_failed') {
        wsProgressReceivedRef.current = true;
        setStatus(event.status);
        setProgress(event.progress);
        if (event.currentStep) setCurrentStep(event.currentStep);
        if (event.kind === 'search_finished' && event.expertCount != null) {
          const baseline = expertsBaselineRef.current;
          const absolute = Math.max(0, event.expertCount);
          const next = baseline > 0 ? Math.max(0, absolute - baseline) : absolute;
          setExpertsFound(next);
        }
        if (event.error) setError(event.error);
        setIsTerminal(true);
        if (searchId != null) clearExpertSearchAppendBaseline(searchId);
        if (!terminalHandledRef.current) {
          terminalHandledRef.current = true;
          onTerminalRef.current?.(event);
        }
      }
    },
    [searchId]
  );

  const socketStatus = useReconnectingSocket({
    url: resolvedUrl,
    enabled: socketEnabled,
    fatalCloseCodes: FATAL_CLOSE_CODES,
    onMessage: (data) => {
      const event = parseExpertSearchWsEvent(data);
      if (event) handleEvent(event);
    },
    onReconnect: () => {
      void applyDetailSnapshot();
    },
  });

  useEffect(() => {
    terminalHandledRef.current = false;
    wsProgressReceivedRef.current = false;
    setIsTerminal(false);
    setError(null);
    setExpertsFound(0);
    setProgress(seed?.progress ?? 0);
    setCurrentStep(seed?.currentStep ?? '');
    setStatus(seed?.status ?? null);
  }, [searchId, runKey, baseline]);

  useEffect(() => {
    if (!enabled || wsProgressReceivedRef.current) return;
    if (seed?.status != null) setStatus(seed.status);
    if (typeof seed?.progress === 'number') {
      setProgress((prev) => Math.max(prev, seed.progress!));
    }
    if (seed?.currentStep) {
      setCurrentStep((prev) => prev || seed.currentStep!);
    }
  }, [enabled, seed?.status, seed?.progress, seed?.currentStep]);

  return {
    progress,
    currentStep,
    status,
    expertsFound,
    error,
    isConnected: socketStatus === 'open',
    isTerminal,
    socketStatus,
  };
}
