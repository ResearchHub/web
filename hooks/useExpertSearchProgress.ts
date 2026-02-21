'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { transformExpertSearchProgressEvent } from '@/types/expertFinder';
import { SearchStatus, ExpertFinderService } from '@/services/expertFinder.service';

interface UseExpertSearchProgressReturn {
  progress: number;
  currentStep: string;
  status: SearchStatus | 'connected' | null;
  error: string | null;
  isConnected: boolean;
}

/**
 * SSE hook for tracking expert search progress.
 *
 * The hook automatically cleans up when:
 * - The search reaches "completed" or "failed" status
 * - The component unmounts
 * - The searchId changes
 */
export const useExpertSearchProgress = (
  searchId: number | string | null
): UseExpertSearchProgressReturn => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [status, setStatus] = useState<SearchStatus | 'connected' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!searchId) return;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connect = async () => {
      try {
        const response = await ExpertFinderService.openProgressStream(
          searchId,
          abortController.signal
        );

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        setIsConnected(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done || abortController.signal.aborted) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || '';

          for (const message of messages) {
            if (!message.trim()) continue;

            const lines = message.split('\n');
            let eventType = '';
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                eventData = line.slice(6);
              }
            }

            if (!eventData) continue;

            try {
              const data = transformExpertSearchProgressEvent(
                JSON.parse(eventData) as Record<string, unknown>
              );

              if (eventType === 'connected') {
                setStatus('connected');
                continue;
              }

              if (eventType === 'complete') {
                setStatus('completed');
                cleanup();
                return;
              }

              if (eventType === 'progress') {
                if (data.status && data.status !== 'connected') {
                  setStatus(data.status);
                }
                if (typeof data.progress === 'number') {
                  setProgress(data.progress);
                }
                if (data.currentStep) {
                  setCurrentStep(data.currentStep);
                }
                if (data.error) {
                  setError(data.error);
                }
                if (data.status === 'completed' || data.status === 'failed') {
                  cleanup();
                  return;
                }
              }
            } catch {
              /* skip malformed event data */
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err?.message || 'Failed to connect to progress stream');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      cleanup();
    };
  }, [searchId, cleanup]);

  return {
    progress,
    currentStep,
    status,
    error,
    isConnected,
  };
};
