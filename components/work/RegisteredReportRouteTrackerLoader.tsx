'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostService } from '@/services/post.service';
import {
  createRegisteredReportTrackerPayload,
  type RegisteredReportStage,
  type RegisteredReportTrackerPayload,
} from '@/types/registeredReport';
import {
  doesRegisteredReportPayloadMatchRoute,
  parseRegisteredReportId,
} from '@/utils/registeredReportRoute';
import { useRegisteredReportWorkflow } from '@/contexts/RegisteredReportWorkflowContext';
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
}: RegisteredReportRouteTrackerLoaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getCachedTracker, cacheTracker } = useRegisteredReportWorkflow();
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = parseRegisteredReportId(reportIdParam);
  const cachedTracker = requestedReportId ? getCachedTracker(requestedReportId) : null;
  const cachedRouteTracker =
    cachedTracker &&
    doesRegisteredReportPayloadMatchRoute({
      payload: cachedTracker,
      currentStage,
      currentPostId,
    })
      ? cachedTracker
      : null;
  const [clientTracker, setClientTracker] = useState<RegisteredReportTrackerPayload | null>(null);
  const reportTracker =
    cachedRouteTracker ?? (clientTracker?.reportId === requestedReportId ? clientTracker : null);

  useEffect(() => {
    if (cachedRouteTracker) return;

    if (!reportIdParam) {
      setClientTracker(null);
      return;
    }

    const reportId = parseRegisteredReportId(reportIdParam);
    if (!reportId) {
      router.replace('/404');
      return;
    }

    let isActive = true;

    PostService.getRegisteredReportWork(reportId)
      .then((payload) => {
        if (!isActive) return;

        const matchesRoute = doesRegisteredReportPayloadMatchRoute({
          payload,
          currentStage,
          currentPostId,
        });
        if (!matchesRoute) {
          router.replace('/404');
          return;
        }

        const tracker = createRegisteredReportTrackerPayload(payload);
        setClientTracker(tracker);
        cacheTracker(tracker);
      })
      .catch(() => {
        if (isActive) {
          router.replace('/404');
        }
      });

    return () => {
      isActive = false;
    };
  }, [cacheTracker, cachedRouteTracker, currentPostId, currentStage, reportIdParam, router]);

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
