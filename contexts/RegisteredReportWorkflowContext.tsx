'use client';

import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type { RegisteredReportTrackerPayload } from '@/types/registeredReport';

interface RegisteredReportWorkflowContextValue {
  getCachedTracker: (reportId: number) => RegisteredReportTrackerPayload | null;
  cacheTracker: (payload: RegisteredReportTrackerPayload) => void;
}

const RegisteredReportWorkflowContext = createContext<RegisteredReportWorkflowContextValue | null>(
  null
);

export function RegisteredReportWorkflowProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cachedTrackerRef = useRef<RegisteredReportTrackerPayload | null>(null);

  const getCachedTracker = useCallback((reportId: number) => {
    const tracker = cachedTrackerRef.current;
    return tracker?.reportId === reportId ? tracker : null;
  }, []);

  const cacheTracker = useCallback((payload: RegisteredReportTrackerPayload) => {
    const current = cachedTrackerRef.current;
    if (current?.reportId === payload.reportId && current.tracker === payload.tracker) return;

    cachedTrackerRef.current = payload;
  }, []);

  const value = useMemo(
    () => ({ getCachedTracker, cacheTracker }),
    [cacheTracker, getCachedTracker]
  );

  return (
    <RegisteredReportWorkflowContext.Provider value={value}>
      {children}
    </RegisteredReportWorkflowContext.Provider>
  );
}

export function useRegisteredReportWorkflow() {
  const context = useContext(RegisteredReportWorkflowContext);

  if (!context) {
    throw new Error(
      'useRegisteredReportWorkflow must be used within RegisteredReportWorkflowProvider'
    );
  }

  return context;
}
