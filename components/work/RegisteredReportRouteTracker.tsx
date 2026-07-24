import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { RegisteredReportStage, RegisteredReportTrackerStep } from '@/types/registeredReport';
import { buildRegisteredReportTrackerHref } from '@/utils/registeredReportRoute';

interface RegisteredReportRouteTrackerProps {
  tracker: RegisteredReportTrackerStep[];
  reportId: number;
  currentStage: RegisteredReportStage;
}

export function RegisteredReportRouteTracker({
  tracker,
  reportId,
  currentStage,
}: Readonly<RegisteredReportRouteTrackerProps>) {
  return (
    <nav aria-label="Research journey" className="flex flex-wrap items-center gap-1.5 text-sm">
      {tracker.map((step, stepIndex) => {
        const href = buildRegisteredReportTrackerHref(step, reportId);
        const isCurrent = step.stage === currentStage;

        return (
          <div key={step.stage} className="flex items-center gap-1.5">
            {stepIndex > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            {href && !isCurrent ? (
              <Link
                href={href}
                className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                {step.label}
              </Link>
            ) : (
              <span
                className={isCurrent ? 'font-semibold text-gray-900' : 'text-gray-400'}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {step.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function RegisteredReportRouteTrackerSkeleton() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {['w-24', 'w-16', 'w-28'].map((width, index) => (
        <div key={width} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
          <div className={`h-4 ${width} animate-pulse rounded bg-gray-200`} />
        </div>
      ))}
    </div>
  );
}
