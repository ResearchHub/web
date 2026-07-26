import type { RegisteredReportWorkResponse } from '@/types/registeredReport';

export function normalizeRegisteredReportId(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;

  const normalized = Number(value);
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
}

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
