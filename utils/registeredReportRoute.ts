import { buildWorkUrl, generateSlug } from '@/utils/url';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerStep,
  RegisteredReportWorkResponse,
} from '@/types/registeredReport';

export type NextSearchParams = Record<string, string | string[] | undefined>;

export function buildRegisteredReportTrackerHref(
  step: RegisteredReportTrackerStep,
  reportId: number
): string | null {
  if (!step.exists || !step.postId) return null;

  const href = buildRegisteredReportStepHref(step.stage, step.postId, step.title);
  return step.stage === 'registered_report' ? href : `${href}?rr=${reportId}`;
}

export function buildRegisteredReportUrl(reportId: string | number, slug?: string | null): string {
  return slug ? `/report/${reportId}/${slug}` : `/report/${reportId}`;
}

function buildRegisteredReportStepHref(
  stage: RegisteredReportStage,
  postId: number,
  title?: string | null
): string {
  const slug = title ? generateSlug(title) : undefined;

  if (stage === 'grant') {
    return buildWorkUrl({ id: postId, slug, contentType: 'funding_request' });
  }

  if (stage === 'proposal') {
    return buildWorkUrl({ id: postId, slug, contentType: 'preregistration' });
  }

  return buildRegisteredReportUrl(postId, slug);
}

export function createUrlSearchParams(searchParams?: NextSearchParams): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  });

  return params;
}

export function hasRegisteredReportSourceProposal(
  payload: Pick<RegisteredReportWorkResponse, 'proposal' | 'tracker'>
): boolean {
  return Boolean(
    payload.proposal &&
    payload.tracker.some((step) => step.stage === 'proposal' && step.exists && step.postId)
  );
}

export function getAccessibleRegisteredReportTracker(
  payload: Pick<RegisteredReportWorkResponse, 'proposal' | 'tracker'>
): RegisteredReportTrackerStep[] {
  if (payload.proposal) return payload.tracker;

  return payload.tracker.map((step) =>
    step.stage === 'proposal' ? { ...step, exists: false, postId: null, title: null } : step
  );
}
