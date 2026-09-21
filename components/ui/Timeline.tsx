import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  /** Leads the title. */
  icon?: LucideIcon;
}

interface TimelineProps {
  steps: TimelineStep[];
  /** The step filled in to read as "you are here". */
  activeIndex?: number;
  className?: string;
  'aria-label'?: string;
}

/**
 * Vertical timeline: a small dot per step with a title and a single line
 * under each. The rail between dots stops short of them at both ends.
 */
export function Timeline({
  steps,
  activeIndex = 0,
  className,
  'aria-label': ariaLabel,
}: Readonly<TimelineProps>) {
  return (
    <ol aria-label={ariaLabel} className={cn('flex flex-col', className)}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isLast = index === steps.length - 1;
        const StepIcon = step.icon;

        return (
          <li key={step.id} aria-current={isActive ? 'step' : undefined} className="flex gap-3.5">
            {/* The dot sits on the title's first line; the rail fills the rest. */}
            <div className="flex w-2.5 flex-shrink-0 flex-col items-center pt-[5px]">
              <span
                aria-hidden="true"
                className={cn(
                  'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                  isActive ? 'bg-rhBlue-600 ring-4 ring-rhBlue-100' : 'bg-gray-300'
                )}
              />
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="mb-[3px] mt-2 w-0.5 flex-1 rounded-full bg-gray-200"
                />
              )}
            </div>
            <div className={cn('min-w-0 flex-1', !isLast && 'pb-5')}>
              <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-[1.3] text-gray-900">
                {StepIcon && (
                  <StepIcon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-rhBlue-600' : 'text-gray-400'
                    )}
                    aria-hidden="true"
                  />
                )}
                {step.title}
              </div>
              {/* Indented past the icon (16px + 6px gap) to sit under the title. */}
              <div
                className={cn(
                  'mt-0.5 text-sm leading-[1.5] text-gray-500',
                  StepIcon && 'pl-[22px]'
                )}
              >
                {step.description}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
