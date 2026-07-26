import type { RegisteredReportWorkResponse } from '@/types/registeredReport';

export function buildRegisteredReportUrl(reportId: string | number, slug?: string | null): string {
  return slug ? `/report/${reportId}/${slug}` : `/report/${reportId}`;
}

export function hasRegisteredReportSourceProposal(
  payload: Pick<RegisteredReportWorkResponse, 'proposal' | 'tracker'>
): boolean {
  return (
    payload.proposal !== null &&
    payload.tracker.some((step) => step.stage === 'proposal' && step.exists && step.postId !== null)
  );
}
