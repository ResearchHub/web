'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostService } from '@/services/post.service';
import type { RegisteredReportStage, RegisteredReportWorkResponse } from '@/types/registeredReport';
import {
  decodeRegisteredReportRoutePayload,
  doesOptionalRouteIdMatch,
  doesRegisteredReportPayloadMatchRoute,
  encodeRegisteredReportRoutePayload,
} from '@/utils/registeredReportRoute';
import { RegisteredReportRouteTracker } from './RegisteredReportRouteTracker';

interface RegisteredReportHeaderTabsProps {
  children: ReactNode;
  currentStage: RegisteredReportStage;
  currentPostId: number;
  currentGrantId?: number | string | null;
  currentFundraiseId?: number | string | null;
  reportPayload?: RegisteredReportWorkResponse;
}

/**
 * Renders the registered-report tracker above the normal work tabs when context exists.
 */
export function RegisteredReportHeaderTabs({
  children,
  currentStage,
  currentPostId,
  currentGrantId,
  currentFundraiseId,
  reportPayload,
}: RegisteredReportHeaderTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeToken = searchParams.get('rr');
  const [clientPayload, setClientPayload] = useState<RegisteredReportWorkResponse | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);

  const reportToken = useMemo(() => {
    if (!reportPayload) return null;
    return encodeRegisteredReportRoutePayload({ r: reportPayload.work.id });
  }, [reportPayload]);

  useEffect(() => {
    if (reportPayload) return;

    if (!routeToken) {
      setClientPayload(null);
      setClientToken(null);
      return;
    }

    const routePayload = decodeRegisteredReportRoutePayload(routeToken);
    if (!routePayload) {
      router.replace('/404');
      return;
    }

    let isActive = true;

    PostService.getRegisteredReportWork(routePayload.r)
      .then((payload) => {
        if (!isActive) return;

        const matchesRoute = doesRegisteredReportPayloadMatchRoute({
          payload,
          currentStage,
          currentPostId,
        });
        const matchesGrant = doesOptionalRouteIdMatch({
          tokenValue: routePayload.g,
          currentValue: currentGrantId,
        });
        const matchesFundraise = doesOptionalRouteIdMatch({
          tokenValue: routePayload.f,
          currentValue: currentFundraiseId,
        });

        if (!matchesRoute || !matchesGrant || !matchesFundraise) {
          router.replace('/404');
          return;
        }

        setClientPayload(payload);
        setClientToken(routeToken);
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
    currentFundraiseId,
    currentGrantId,
    currentPostId,
    currentStage,
    reportPayload,
    routeToken,
    router,
  ]);

  const trackerPayload = reportPayload ?? clientPayload;
  const trackerToken = reportToken ?? clientToken;

  return (
    <div className="space-y-3">
      {trackerPayload && trackerToken && (
        <RegisteredReportRouteTracker
          payload={trackerPayload}
          rr={trackerToken}
          currentStage={currentStage}
        />
      )}
      {children}
    </div>
  );
}
