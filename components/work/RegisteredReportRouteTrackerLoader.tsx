'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PostService } from '@/services/post.service';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerPayload,
} from '@/types/registeredReport';
import {
  doesRegisteredReportPayloadMatchRoute,
  parseRegisteredReportId,
} from '@/utils/registeredReportRoute';
import {
  RegisteredReportRouteTracker,
  RegisteredReportRouteTrackerSkeleton,
} from './RegisteredReportRouteTracker';

interface RegisteredReportRouteTrackerLoaderProps {
  currentStage: RegisteredReportStage;
  currentPostId: number;
}

export function RegisteredReportRouteTrackerLoader({
  currentStage,
  currentPostId,
}: Readonly<RegisteredReportRouteTrackerLoaderProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = parseRegisteredReportId(reportIdParam);
  const [loadedTracker, setLoadedTracker] = useState<RegisteredReportTrackerPayload | null>(null);
  const reportTracker = loadedTracker?.reportId === requestedReportId ? loadedTracker : null;

  useEffect(() => {
    const clearReportId = () => {
      setLoadedTracker(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('rr');
      router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
    };

    if (!reportIdParam) {
      setLoadedTracker(null);
      return;
    }

    const reportId = parseRegisteredReportId(reportIdParam);
    if (!reportId) {
      clearReportId();
      return;
    }

    let isActive = true;

    PostService.getRegisteredReportWork(reportId)
      .then((payload) => {
        if (!isActive) return;

        if (!doesRegisteredReportPayloadMatchRoute({ payload, currentStage, currentPostId })) {
          clearReportId();
          return;
        }

        const tracker = { reportId: payload.work.id, tracker: payload.tracker };
        setLoadedTracker(tracker);
      })
      .catch(() => {
        if (isActive) clearReportId();
      });

    return () => {
      isActive = false;
    };
  }, [currentPostId, currentStage, pathname, reportIdParam, router, searchParams]);

  if (reportTracker) {
    return (
      <RegisteredReportRouteTracker
        tracker={reportTracker.tracker}
        reportId={reportTracker.reportId}
        currentStage={currentStage}
      />
    );
  }

  return requestedReportId ? <RegisteredReportRouteTrackerSkeleton /> : null;
}
