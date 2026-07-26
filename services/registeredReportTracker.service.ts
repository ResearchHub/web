import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import { getAccessibleRegisteredReportTracker } from '@/utils/registeredReportRoute';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerPayload,
  RegisteredReportWorkResponse,
} from '@/types/registeredReport';

export class RegisteredReportTrackerService {
  static async getTracker(
    reportId: number,
    currentStage: RegisteredReportStage,
    currentPostId: number
  ): Promise<RegisteredReportTrackerPayload | null> {
    let payload: RegisteredReportWorkResponse;
    try {
      payload = await PostService.getRegisteredReportWork(reportId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }

    const tracker = getAccessibleRegisteredReportTracker(payload);
    const trackerReportId = tracker.find(
      (step) => step.stage === 'registered_report' && step.exists
    )?.postId;
    const matchesCurrentPage = tracker.some(
      (step) => step.stage === currentStage && step.exists && step.postId === currentPostId
    );

    if (payload.work.id !== reportId || trackerReportId !== reportId || !matchesCurrentPage) {
      return null;
    }

    return { reportId, tracker };
  }
}
