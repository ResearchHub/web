'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface ProgressStepperStep {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface ProgressStepperProps {
  steps: ProgressStepperStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className={cn('w-full', className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;
          const isClickable = onStepClick && (isCompleted || index <= currentStepIndex + 1);

          return (
            <li
              key={step.id}
              className={cn(
                'flex items-center',
                index < steps.length - 1 ? 'w-full' : '',
                isClickable ? 'cursor-pointer' : 'cursor-default'
              )}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  isActive
                    ? 'bg-primary-100 text-primary-600 border-2 border-primary-500'
                    : isCompleted
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                )}
              >
                {step.icon || (isCompleted ? <CheckIcon className="w-4 h-4" /> : index + 1)}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm font-medium whitespace-nowrap',
                  isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    index < currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'
                  )}
                ></div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
