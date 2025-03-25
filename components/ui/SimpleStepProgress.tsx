'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { ArrowRight } from 'lucide-react';

export type SimpleStep = {
  id: string;
  name: string;
  description?: string;
};

interface SimpleStepProgressProps {
  steps: SimpleStep[];
  currentStepIndex: number;
  className?: string;
  showStepCount?: boolean;
  showDescription?: boolean;
  showNextStep?: boolean;
  progressSize?: 'xs' | 'sm' | 'md';
}

export const SimpleStepProgress: FC<SimpleStepProgressProps> = ({
  steps,
  currentStepIndex,
  className,
  showStepCount = true,
  showDescription = false,
  showNextStep = false,
  progressSize = 'md',
}) => {
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const percentage = ((currentStepIndex + 1) / totalSteps) * 100;

  // Get the next step if it exists and if showNextStep is true
  const nextStep =
    showNextStep && currentStepIndex < totalSteps - 1 ? steps[currentStepIndex + 1] : null;

  // Calculate the height based on the size
  const heightClass = progressSize === 'xs' ? 'h-1.5' : progressSize === 'sm' ? 'h-2' : 'h-2.5';

  return (
    <div className={cn('w-full', className)}>
      {/* Header with step count */}
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium">
          <span className="text-gray-500">Current step: </span>
          <span className="text-gray-900">{currentStep.name}</span>
        </div>

        {showStepCount && (
          <div className="text-sm text-gray-500">
            {currentStepIndex + 1} of {totalSteps}
          </div>
        )}
      </div>

      {/* Description (optional) */}
      {showDescription && currentStep.description && (
        <div className="text-sm text-gray-500 mb-3">{currentStep.description}</div>
      )}

      {/* Simple Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('bg-indigo-600 transition-all duration-300', heightClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Next step indicator */}
      <div className="flex justify-end mt-2">
        {nextStep && (
          <div className="text-sm text-gray-500">
            Next: <span className="mx-1">→</span>
            <span className="text-gray-700">{nextStep.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
