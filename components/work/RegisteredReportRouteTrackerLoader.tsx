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
}

interface LoadedTracker extends RegisteredReportTrackerPayload {
  routeKey: string;
}

async function fetchRegisteredReportTracker(
  reportId: number,
  currentStage: RegisteredReportStage,
  currentPostId: number
): Promise<RegisteredReportTrackerPayload | null> {
  const params = new URLSearchParams({
    rr: reportId.toString(),
    stage: currentStage,
    postId: currentPostId.toString(),
  });
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
}: Readonly<RegisteredReportRouteTrackerLoaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = normalizeRegisteredReportId(reportIdParam);
  const routeKey = requestedReportId
    ? `${requestedReportId}:${currentStage}:${currentPostId}`
    : null;
  const [loadedTracker, setLoadedTracker] = useState<LoadedTracker | null>(null);
  const [failedRouteKey, setFailedRouteKey] = useState<string | null>(null);
  const reportTracker = loadedTracker?.routeKey === routeKey ? loadedTracker : null;

  useEffect(() => {
    const clearReportId = () => {
      setLoadedTracker(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('rr');
      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
    };

    if (!reportIdParam) {
      setLoadedTracker(null);
      setFailedRouteKey(null);
      return;
    }

    if (!requestedReportId || !routeKey) {
      clearReportId();
      return;
    }

    let isActive = true;
    setFailedRouteKey(null);

    fetchRegisteredReportTracker(requestedReportId, currentStage, currentPostId)
      .then((tracker) => {
        if (!isActive) return;
        if (!tracker) {
          clearReportId();
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

  return requestedReportId && failedRouteKey !== routeKey ? (
    <RegisteredReportRouteTrackerSkeleton />
  ) : null;
}
