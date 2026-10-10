'use client';

import { Loader2, Users } from 'lucide-react';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/utils/styles';
import type { SearchStatus } from '@/services/expertFinder.service';

export interface ExpertSearchLiveStatusProps {
  progress: number;
  currentStep: string;
  status: SearchStatus | null;
  expertsFound: number;
  isAppendRun?: boolean;
  className?: string;
}

function statusLabel(status: SearchStatus | null): string {
  if (status === 'pending') return 'Starting…';
  if (status === 'processing') return 'Searching…';
  if (status === 'completed') return 'Complete';
  if (status === 'failed') return 'Failed';
  return 'Connecting…';
}

export function ExpertSearchLiveStatus({
  progress,
  currentStep,
  status,
  expertsFound,
  isAppendRun = false,
  className,
}: Readonly<ExpertSearchLiveStatusProps>) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const stepText = currentStep.trim() || 'Finding experts… This can take a bit of time.';
  const showSpinner = status !== 'completed' && status !== 'failed';
  const expertsLabel =
    expertsFound === 1
      ? isAppendRun
        ? 'new expert found'
        : 'expert found'
      : isAppendRun
        ? 'new experts found'
        : 'experts found';

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/80 px-4 py-4 shadow-sm',
        className
      )}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {showSpinner ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-600" aria-hidden />
          ) : null}
          <span className="text-sm font-semibold text-gray-900">{statusLabel(status)}</span>
        </div>
        {expertsFound > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
            <Users className="h-3.5 w-3.5 text-gray-500" aria-hidden />
            <span className="tabular-nums font-medium">{expertsFound}</span>
            <span className="text-gray-500">{expertsLabel}</span>
          </span>
        ) : null}
      </div>

      <Progress value={clampedProgress} max={100} size="sm" variant="primary" className="mt-3" />

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 flex-1 text-sm text-gray-600 transition-opacity duration-200">
          {stepText}
        </p>
        <span className="shrink-0 text-xs font-medium tabular-nums text-gray-500">
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
}
