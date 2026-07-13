'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostService } from '@/services/post.service';
import type { RegisteredReportStage, RegisteredReportWorkResponse } from '@/types/registeredReport';
import {
  doesRegisteredReportPayloadMatchRoute,
  parseRegisteredReportId,
} from '@/utils/registeredReportRoute';
import { RegisteredReportRouteTracker } from './RegisteredReportRouteTracker';

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
  const reportIdParam = searchParams.get('rr');
  const requestedReportId = parseRegisteredReportId(reportIdParam);
  const [clientPayload, setClientPayload] = useState<RegisteredReportWorkResponse | null>(null);
  const reportId =
    reportPayload?.work.id ??
    (clientPayload?.work.id === requestedReportId ? requestedReportId : null);

  useEffect(() => {
    if (reportPayload) return;

    if (!reportIdParam) {
      setClientPayload(null);
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

        setClientPayload(payload);
      })
      .catch(() => {
        if (isActive) {
          router.replace('/404');
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentPostId, currentStage, reportPayload, reportIdParam, router]);

  const trackerPayload = reportPayload ?? clientPayload;

  return (
    <div className="space-y-3">
      {trackerPayload && reportId && (
        <RegisteredReportRouteTracker
          payload={trackerPayload}
          reportId={reportId}
          currentStage={currentStage}
        />
      )}
      {children}
    </div>
  );
}
