'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { RegisteredReportStage, RegisteredReportTrackerStep } from '@/types/registeredReport';
import { useRegisteredReportTracker } from '@/hooks/useRegisteredReportTracker';
import { appendQueryString } from '@/utils/url';
import {
  RegisteredReportRouteTracker,
  RegisteredReportRouteTrackerSkeleton,
} from './RegisteredReportRouteTracker';

interface RegisteredReportRouteTrackerLoaderProps {
  currentStage: RegisteredReportStage;
  currentPostId: number;
  registeredReportId?: number | null;
  trackerWithoutReport?: RegisteredReportTrackerStep[];
}

export function RegisteredReportRouteTrackerLoader({
  currentStage,
  currentPostId,
  registeredReportId,
  trackerWithoutReport,
}: Readonly<RegisteredReportRouteTrackerLoaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRouteReportId = searchParams.has('rr');
  const routeReportIdParam = searchParams.get('rr');
  const reportIdFromRoute = routeReportIdParam ? Number(routeReportIdParam) : null;
  const hasMalformedRouteReportId = hasRouteReportId && !reportIdFromRoute;
  const selectedReportId = hasMalformedRouteReportId
    ? null
    : (reportIdFromRoute ?? registeredReportId ?? null);
  const {
    tracker: reportTracker,
    isLoading,
    isNotFound,
  } = useRegisteredReportTracker(selectedReportId, currentStage, currentPostId);

  useEffect(() => {
    if (!hasRouteReportId || (!hasMalformedRouteReportId && !isNotFound)) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('rr');
    router.replace(appendQueryString(pathname, params));
  }, [hasMalformedRouteReportId, hasRouteReportId, isNotFound, pathname, router, searchParams]);

  if (reportTracker) {
    return (
      <RegisteredReportRouteTracker
        tracker={reportTracker.tracker}
        reportId={reportTracker.reportId}
        currentStage={currentStage}
      />
    );
  }

  if (!selectedReportId && trackerWithoutReport) {
    return (
      <RegisteredReportRouteTracker tracker={trackerWithoutReport} currentStage={currentStage} />
    );
  }

  return isLoading ? <RegisteredReportRouteTrackerSkeleton /> : null;
}
