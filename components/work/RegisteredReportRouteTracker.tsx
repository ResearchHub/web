import { Coins, FileInput, Landmark } from 'lucide-react';
import type { RegisteredReportStage, RegisteredReportWorkResponse } from '@/types/registeredReport';
import { cn } from '@/utils/styles';
import { buildRegisteredReportTrackerHref } from '@/utils/registeredReportRoute';

const STAGE_ICONS: Record<RegisteredReportStage, typeof Landmark> = {
  grant: Landmark,
  proposal: Coins,
  registered_report: FileInput,
};

const TRACKER_CLIP_PATHS = {
  first: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  middle: 'polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
  last: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)',
} as const;

interface RegisteredReportRouteTrackerProps {
  payload: RegisteredReportWorkResponse;
  rr: string;
  currentStage: RegisteredReportStage;
}

/**
 * Renders the registered-report tracker with normal page links.
 */
export function RegisteredReportRouteTracker({
  payload,
  rr,
  currentStage,
}: RegisteredReportRouteTrackerProps) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-0.5 bg-gray-50 py-1">
      {payload.tracker.map((step, stepIndex) => {
        const StepIcon = STAGE_ICONS[step.stage];
        const state = getTrackerState(step.stage, step.exists, currentStage);
        const href = buildRegisteredReportTrackerHref(step, rr);
        const isDisabled = !href || state === 'current';
        const className = cn(
          'relative flex min-h-[54px] items-center justify-center gap-2 border px-3 py-2 text-xs font-semibold transition-all',
          state === 'current' &&
            'z-10 scale-[1.02] border-primary-700 bg-primary-700 text-white shadow-md ring-2 ring-primary-200 ring-offset-2',
          state === 'complete' &&
            'border-primary-500 bg-primary-500 text-white hover:bg-primary-600 hover:shadow-sm',
          state === 'missing' && 'border-gray-200 bg-white text-gray-400',
          stepIndex === 0 && 'rounded-l-lg',
          stepIndex === payload.tracker.length - 1 && 'rounded-r-lg',
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        );
        const content = (
          <>
            <StepIcon size={16} />
            <span className="hidden sm:inline">{step.label}</span>
            {state === 'current' && (
              <span className="absolute bottom-1 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/80" />
            )}
          </>
        );

        if (isDisabled || !href) {
          return (
            <div
              key={step.stage}
              className={className}
              style={{ clipPath: resolveTrackerClipPath(stepIndex, payload.tracker.length) }}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {content}
            </div>
          );
        }

        return (
          <a
            key={step.stage}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            style={{ clipPath: resolveTrackerClipPath(stepIndex, payload.tracker.length) }}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}

/**
 * Resolves the clipped shape for a tracker segment.
 */
function resolveTrackerClipPath(stepIndex: number, stepCount: number): string {
  if (stepIndex === 0) return TRACKER_CLIP_PATHS.first;
  if (stepIndex === stepCount - 1) return TRACKER_CLIP_PATHS.last;
  return TRACKER_CLIP_PATHS.middle;
}

/**
 * Resolves the visual state for a tracker segment.
 */
function getTrackerState(
  stage: RegisteredReportStage,
  exists: boolean,
  currentStage: RegisteredReportStage
): 'current' | 'complete' | 'missing' {
  if (stage === currentStage) return 'current';
  if (exists) return 'complete';
  return 'missing';
}
