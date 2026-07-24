'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerPayload,
} from '@/types/registeredReport';
import { normalizeRegisteredReportId } from '@/utils/registeredReportPrefill';
import {
  RegisteredReportRouteTracker,
  RegisteredReportRouteTrackerSkeleton,
} from './RegisteredReportRouteTracker';

interface RegisteredReportRouteTrackerLoaderProps {
  currentStage: RegisteredReportStage;
  currentPostId: number;
  registeredReportId?: number | null;
}

interface LoadedTracker extends RegisteredReportTrackerPayload {
  routeKey: string;
}

type RegisteredReportIdParameter = 'registered_report_id' | 'rr';

async function fetchRegisteredReportTracker(
  registeredReportId: number,
  registeredReportIdParameter: RegisteredReportIdParameter,
  currentStage: RegisteredReportStage,
  currentPostId: number
): Promise<RegisteredReportTrackerPayload | null> {
  const params = new URLSearchParams({
    stage: currentStage,
    postId: currentPostId.toString(),
  });
  params.set(registeredReportIdParameter, registeredReportId.toString());
  const response = await fetch(`/api/registered-report-tracker?${params}`, {
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to load the Registered Report tracker (${response.status}).`);
  }

  return response.json();
}

export function RegisteredReportRouteTrackerLoader({
  currentStage,
  currentPostId,
  registeredReportId,
}: Readonly<RegisteredReportRouteTrackerLoaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = normalizeRegisteredReportId(reportIdParam);
  const selectedReportId = requestedReportId ?? registeredReportId ?? null;
  const routeKey = selectedReportId ? `${selectedReportId}:${currentStage}:${currentPostId}` : null;
  const [loadedTracker, setLoadedTracker] = useState<LoadedTracker | null>(null);
  const [failedRouteKey, setFailedRouteKey] = useState<string | null>(null);
  const reportTracker = loadedTracker?.routeKey === routeKey ? loadedTracker : null;

  useEffect(() => {
    const clearReportId = () => {
      setLoadedTracker(null);
      if (!reportIdParam) return;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('rr');
      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
    };

    if (reportIdParam && !requestedReportId) {
      clearReportId();
      return;
    }

    if (!selectedReportId || !routeKey) {
      setLoadedTracker(null);
      setFailedRouteKey(null);
      return;
    }

    let isActive = true;
    setFailedRouteKey(null);

    fetchRegisteredReportTracker(
      selectedReportId,
      requestedReportId ? 'rr' : 'registered_report_id',
      currentStage,
      currentPostId
    )
      .then((tracker) => {
        if (!isActive) return;
        if (!tracker) {
          clearReportId();
          setFailedRouteKey(routeKey);
          return;
        }
        setLoadedTracker({ ...tracker, routeKey });
      })
      .catch(() => {
        if (isActive) setFailedRouteKey(routeKey);
      });

    return () => {
      isActive = false;
    };
  }, [
    currentPostId,
    currentStage,
    pathname,
    reportIdParam,
    requestedReportId,
    routeKey,
    router,
    searchParams,
    selectedReportId,
  ]);

  if (reportTracker) {
    return (
      <RegisteredReportRouteTracker
        tracker={reportTracker.tracker}
        reportId={reportTracker.reportId}
        currentStage={currentStage}
      />
    );
  }

  return routeKey && failedRouteKey !== routeKey ? <RegisteredReportRouteTrackerSkeleton /> : null;
}
