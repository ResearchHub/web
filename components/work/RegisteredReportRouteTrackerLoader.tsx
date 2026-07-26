'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerPayload,
} from '@/types/registeredReport';
import { appendQueryString } from '@/utils/url';
import { normalizeRegisteredReportId } from '@/utils/registeredReportRoute';
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

async function fetchRegisteredReportTracker(
  registeredReportId: number,
  reportIdParameter: 'registered_report_id' | 'rr',
  currentStage: RegisteredReportStage,
  currentPostId: number
): Promise<RegisteredReportTrackerPayload | null> {
  const params = new URLSearchParams({
    stage: currentStage,
    postId: currentPostId.toString(),
  });
  params.set(reportIdParameter, registeredReportId.toString());

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
  const hasRouteReportId = searchParams.has('rr');
  const routeReportIdParam = searchParams.get('rr');
  const reportIdFromRoute = normalizeRegisteredReportId(routeReportIdParam);
  const hasMalformedRouteReportId = hasRouteReportId && !reportIdFromRoute;
  const selectedReportId = hasMalformedRouteReportId
    ? null
    : (reportIdFromRoute ?? registeredReportId ?? null);
  const routeKey = selectedReportId ? `${selectedReportId}:${currentStage}:${currentPostId}` : null;
  const [loadedTracker, setLoadedTracker] = useState<LoadedTracker | null>(null);
  const [failedRouteKey, setFailedRouteKey] = useState<string | null>(null);
  const reportTracker = loadedTracker?.routeKey === routeKey ? loadedTracker : null;

  useEffect(() => {
    const clearRouteReportId = () => {
      setLoadedTracker(null);
      if (!hasRouteReportId) return;

      const params = new URLSearchParams(searchParams.toString());
      params.delete('rr');
      router.replace(appendQueryString(pathname, params));
    };

    if (hasMalformedRouteReportId) {
      clearRouteReportId();
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
      reportIdFromRoute ? 'rr' : 'registered_report_id',
      currentStage,
      currentPostId
    )
      .then((tracker) => {
        if (!isActive) return;
        if (!tracker) {
          clearRouteReportId();
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
    hasMalformedRouteReportId,
    hasRouteReportId,
    pathname,
    reportIdFromRoute,
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
