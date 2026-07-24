import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import type { RegisteredReportStage } from '@/types/registeredReport';
import { getAccessibleRegisteredReportTracker } from '@/utils/registeredReportRoute';
import { normalizeRegisteredReportId } from '@/utils/registeredReportPrefill';

function isRegisteredReportStage(value: string | null): value is RegisteredReportStage {
  return value === 'grant' || value === 'proposal' || value === 'registered_report';
}

async function getRegisteredReportTracker(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reportIdFromPayload = normalizeRegisteredReportId(searchParams.get('registered_report_id'));
  const reportIdFromRoute = normalizeRegisteredReportId(searchParams.get('rr'));
  const registeredReportId = reportIdFromPayload ?? reportIdFromRoute;
  const currentPostId = normalizeRegisteredReportId(searchParams.get('postId'));
  const currentStage = searchParams.get('stage');

  if (
    !registeredReportId ||
    !currentPostId ||
    !isRegisteredReportStage(currentStage) ||
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
    const matchesRoute = tracker.some(
      (step) => step.stage === currentStage && step.exists && step.postId === currentPostId
    );
    if (
      !trackerReportId ||
      payload.work.id !== registeredReportId ||
      trackerReportId !== registeredReportId ||
      !matchesRoute
    ) {
      return NextResponse.json({ error: 'Registered Report tracker not found.' }, { status: 404 });
    }

    return NextResponse.json({ reportId: registeredReportId, tracker });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;

    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 502;
    return NextResponse.json(
      { error: 'Unable to load the Registered Report tracker.' },
      { status }
    );
  }
}

export { getRegisteredReportTracker as GET };
