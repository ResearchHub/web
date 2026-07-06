'use client';

import { FC } from 'react';
import { HandCoins, FileText, ClipboardCheck, FlaskConical, Check } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ReportStage } from '../lib/mockData';

interface TrackerStep {
  key: ReportStage;
  label: string;
  sublabel: string;
  icon: typeof HandCoins;
}

const STEPS: TrackerStep[] = [
  { key: 'funding', label: 'Funding', sublabel: 'Funding opportunity', icon: HandCoins },
  { key: 'proposal', label: 'Proposal', sublabel: 'Funded on ResearchHub', icon: FileText },
  { key: 'report', label: 'R. Report', sublabel: 'Protocol peer reviewed', icon: ClipboardCheck },
  { key: 'results', label: 'Results', sublabel: 'Version of record', icon: FlaskConical },
];

interface RegisteredReportTrackerProps {
  currentStage: ReportStage;
  className?: string;
}

/**
 * A Domino's-pizza-tracker-style breadcrumb showing where a work sits in the
 * ResearchHub registered-report lifecycle: Funding → Proposal → R. Report → Results.
 */
export const RegisteredReportTracker: FC<RegisteredReportTrackerProps> = ({
  currentStage,
  className,
}) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStage);

  return (
    <div
      className={cn('rounded-xl border border-gray-200 bg-white p-4 sm:!p-5 shadow-sm', className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Research journey</h3>
        <span className="text-xs font-medium text-primary-600">
          Step {currentIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex items-start">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {/* Left connector */}
                <div
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    index === 0
                      ? 'bg-transparent'
                      : index <= currentIndex
                        ? 'bg-primary-500'
                        : 'bg-gray-200'
                  )}
                />

                {/* Node */}
                <div
                  className={cn(
                    'relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    isComplete && 'border-primary-500 bg-primary-500 text-white',
                    isCurrent &&
                      'border-primary-500 bg-primary-50 text-primary-600 ring-4 ring-primary-100',
                    isUpcoming && 'border-gray-200 bg-gray-50 text-gray-400'
                  )}
                >
                  {isComplete ? <Check size={20} strokeWidth={2.5} /> : <Icon size={20} />}
                  {isCurrent && (
                    <span className="absolute -bottom-1 h-2 w-2 animate-pulse rounded-full bg-primary-500" />
                  )}
                </div>

                {/* Right connector */}
                <div
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    index === STEPS.length - 1
                      ? 'bg-transparent'
                      : index < currentIndex
                        ? 'bg-primary-500'
                        : 'bg-gray-200'
                  )}
                />
              </div>

              <div className="mt-2 px-1 text-center">
                <p
                  className={cn(
                    'text-xs font-semibold sm:!text-sm',
                    isUpcoming ? 'text-gray-400' : 'text-gray-900'
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'mt-0.5 hidden text-[11px] leading-tight sm:!block',
                    isCurrent ? 'text-primary-600' : 'text-gray-400'
                  )}
                >
                  {isCurrent ? 'You are here' : step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
