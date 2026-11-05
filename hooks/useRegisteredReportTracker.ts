'use client';

import { useEffect, useState } from 'react';
import { RegisteredReportTrackerService } from '@/services/registeredReportTracker.service';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerPayload,
} from '@/types/registeredReport';

interface RegisteredReportTrackerState {
  requestKey: string;
  tracker: RegisteredReportTrackerPayload | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseRegisteredReportTrackerResult {
  tracker: RegisteredReportTrackerPayload | null;
  isLoading: boolean;
  isNotFound: boolean;
}

export function useRegisteredReportTracker(
  reportId: number | null,
  currentStage: RegisteredReportStage,
  currentPostId: number
): UseRegisteredReportTrackerResult {
  const requestKey = reportId ? `${reportId}:${currentStage}:${currentPostId}` : null;
  const [state, setState] = useState<RegisteredReportTrackerState | null>(null);
  const currentState = state?.requestKey === requestKey ? state : null;

  useEffect(() => {
    if (!requestKey || !reportId) {
      setState(null);
      return;
    }

    let cancelled = false;
    setState({ requestKey, tracker: null, error: null, isLoading: true });

    RegisteredReportTrackerService.getTracker(reportId, currentStage, currentPostId)
      .then((tracker) => {
        if (!cancelled) {
          setState({ requestKey, tracker, error: null, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            requestKey,
            tracker: null,
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load the Registered Report tracker.'),
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentPostId, currentStage, reportId, requestKey]);

  return {
    tracker: currentState?.tracker ?? null,
    isLoading: requestKey !== null && (currentState === null || currentState.isLoading),
    isNotFound:
      currentState !== null &&
      !currentState.isLoading &&
      currentState.error === null &&
      currentState.tracker === null,
  };
}
