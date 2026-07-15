'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostService } from '@/services/post.service';
import {
  createRegisteredReportTrackerPayload,
  type RegisteredReportStage,
  type RegisteredReportTrackerPayload,
  type RegisteredReportWorkResponse,
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

interface RegisteredReportHeaderTabsProps {
  children: ReactNode;
  currentStage: RegisteredReportStage;
  currentPostId: number;
  reportPayload?: RegisteredReportWorkResponse;
}

export function RegisteredReportHeaderTabs({
  children,
  currentStage,
  currentPostId,
  reportPayload,
}: RegisteredReportHeaderTabsProps) {
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
  const reportTracker = reportPayload
    ? createRegisteredReportTrackerPayload(reportPayload)
    : (cachedRouteTracker ??
      (clientTracker?.reportId === requestedReportId ? clientTracker : null));

  useEffect(() => {
    if (reportPayload) {
      cacheTracker(createRegisteredReportTrackerPayload(reportPayload));
      return;
    }

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
  }, [
    cacheTracker,
    cachedRouteTracker,
    currentPostId,
    currentStage,
    reportPayload,
    reportIdParam,
    router,
  ]);

  return (
    <div className="space-y-3">
      {reportTracker ? (
        <RegisteredReportRouteTracker
          tracker={reportTracker.tracker}
          reportId={reportTracker.reportId}
          currentStage={currentStage}
          onNavigate={() => cacheTracker(reportTracker)}
        />
      ) : requestedReportId ? (
        <RegisteredReportRouteTrackerSkeleton />
      ) : null}
      {children}
    </div>
  );
}
