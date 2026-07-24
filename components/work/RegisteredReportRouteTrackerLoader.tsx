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
  loadForCompletedProposal?: boolean;
}

interface LoadedTracker extends RegisteredReportTrackerPayload {
  routeKey: string;
}

async function fetchRegisteredReportTracker(
  reportId: number | null,
  currentStage: RegisteredReportStage,
  currentPostId: number
): Promise<RegisteredReportTrackerPayload | null> {
  const params = new URLSearchParams({
    stage: currentStage,
    postId: currentPostId.toString(),
  });
  if (reportId) params.set('rr', reportId.toString());
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
  loadForCompletedProposal = false,
}: Readonly<RegisteredReportRouteTrackerLoaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = normalizeRegisteredReportId(reportIdParam);
  const shouldLoadTracker = Boolean(requestedReportId || loadForCompletedProposal);
  const routeKey = shouldLoadTracker
    ? `${requestedReportId ?? 'current'}:${currentStage}:${currentPostId}`
    : null;
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

    if (!routeKey) {
      setLoadedTracker(null);
      setFailedRouteKey(null);
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
    loadForCompletedProposal,
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

  return routeKey && failedRouteKey !== routeKey ? <RegisteredReportRouteTrackerSkeleton /> : null;
}
