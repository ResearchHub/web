import { type NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import type { RegisteredReportStage } from '@/types/registeredReport';
import {
  getAccessibleRegisteredReportTracker,
  normalizeRegisteredReportId,
} from '@/utils/registeredReportRoute';

function isRegisteredReportStage(value: string | null): value is RegisteredReportStage {
  return value === 'grant' || value === 'proposal' || value === 'registered_report';
}

async function getRegisteredReportTracker(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const payloadReportIdParam = searchParams.get('registered_report_id');
  const routeReportIdParam = searchParams.get('rr');
  const reportIdFromPayload = normalizeRegisteredReportId(payloadReportIdParam);
  const reportIdFromRoute = normalizeRegisteredReportId(routeReportIdParam);
  const registeredReportId = reportIdFromRoute ?? reportIdFromPayload;
  const currentPostId = normalizeRegisteredReportId(searchParams.get('postId'));
  const currentStage = searchParams.get('stage');

  if (
    !registeredReportId ||
    !currentPostId ||
    !isRegisteredReportStage(currentStage) ||
    (payloadReportIdParam !== null && !reportIdFromPayload) ||
    (routeReportIdParam !== null && !reportIdFromRoute) ||
    (reportIdFromPayload && reportIdFromRoute && reportIdFromPayload !== reportIdFromRoute)
  ) {
    return NextResponse.json({ error: 'Invalid tracker request.' }, { status: 400 });
  }

  try {
    const payload = await PostService.getRegisteredReportWork(registeredReportId);
    const tracker = getAccessibleRegisteredReportTracker(payload);
    const trackerReportId = tracker.find(
      (step) => step.stage === 'registered_report' && step.exists
    )?.postId;
    const matchesCurrentPage = tracker.some(
      (step) => step.stage === currentStage && step.exists && step.postId === currentPostId
    );

    if (
      payload.work.id !== registeredReportId ||
      trackerReportId !== registeredReportId ||
      !matchesCurrentPage
    ) {
      return NextResponse.json({ error: 'Registered Report tracker not found.' }, { status: 404 });
    }

    return NextResponse.json({ reportId: registeredReportId, tracker });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;

    const status =
      typeof error.status === 'number' &&
      Number.isInteger(error.status) &&
      error.status >= 400 &&
      error.status < 600
        ? error.status
        : 502;
    return NextResponse.json(
      { error: 'Unable to load the Registered Report tracker.' },
      { status }
    );
  }
}

export { getRegisteredReportTracker as GET };
