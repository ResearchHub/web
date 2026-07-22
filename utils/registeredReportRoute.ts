import { buildWorkUrl, generateSlug } from '@/utils/url';
import type {
  RegisteredReportStage,
  RegisteredReportTrackerStep,
  RegisteredReportWorkResponse,
} from '@/types/registeredReport';

export type NextSearchParams = Record<string, string | string[] | undefined>;

export function isValidRegisteredReportId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function parseRegisteredReportId(value: string | null | undefined): number | null {
  const reportId = Number(value);
  return isValidRegisteredReportId(reportId) ? reportId : null;
}

export function buildRegisteredReportTrackerHref(
  step: RegisteredReportTrackerStep,
  reportId: number | null
): string | null {
  if (!step.exists || !isValidRegisteredReportId(step.postId)) return null;

  const href = buildRegisteredReportStepHref(step.stage, step.postId, step.title);
  return step.stage === 'registered_report' || !isValidRegisteredReportId(reportId)
    ? href
    : `${href}?rr=${reportId}`;
}

export function buildRegisteredReportStepHref(
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

  return slug ? `/report/${postId}/${slug}` : `/report/${postId}`;
}

export function getSingleQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

export function doesRegisteredReportPayloadMatchRoute({
  payload,
  currentStage,
  currentPostId,
}: {
  payload: Pick<RegisteredReportWorkResponse, 'tracker'>;
  currentStage: RegisteredReportStage;
  currentPostId: number | string;
}): boolean {
  const postId = Number(currentPostId);
  if (!Number.isInteger(postId) || postId <= 0) return false;

  const currentStep = payload.tracker.find((step) => step.stage === currentStage);
  return currentStep?.exists === true && currentStep.postId === postId;
}

export function hasRegisteredReportSourceProposal(
  payload: Pick<RegisteredReportWorkResponse, 'proposal' | 'tracker'>
): boolean {
  return Boolean(
    payload.proposal &&
    payload.tracker.some((step) => step.stage === 'proposal' && step.exists && step.postId)
  );
}
