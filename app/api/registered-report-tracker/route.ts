import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import type { RegisteredReportStage } from '@/types/registeredReport';
import { getAccessibleRegisteredReportTracker } from '@/utils/registeredReportRoute';
import { normalizeRegisteredReportId } from '@/utils/registeredReportPrefill';

function isRegisteredReportStage(value: string | null): value is RegisteredReportStage {
  return value === 'grant' || value === 'proposal' || value === 'registered_report';
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reportId = normalizeRegisteredReportId(searchParams.get('rr'));
  const currentPostId = normalizeRegisteredReportId(searchParams.get('postId'));
  const currentStage = searchParams.get('stage');

  if (!currentPostId || !isRegisteredReportStage(currentStage)) {
    return NextResponse.json({ error: 'Invalid tracker request.' }, { status: 400 });
  }

  try {
    const payload = await PostService.getRegisteredReportWork(reportId ?? currentPostId);
    const tracker = getAccessibleRegisteredReportTracker(payload);
    const registeredReportId = tracker.find(
      (step) => step.stage === 'registered_report' && step.exists
    )?.postId;
    const matchesRoute = tracker.some(
      (step) => step.stage === currentStage && step.exists && step.postId === currentPostId
    );
    if (
      !registeredReportId ||
      payload.work.id !== registeredReportId ||
      (reportId !== null && reportId !== registeredReportId) ||
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
