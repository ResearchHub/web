import { clsx } from 'clsx';

export type Step = 'select' | 'metadata' | 'declarations' | 'preview';

interface ProgressStepperProps {
  steps: { id: string; name: string }[];
  currentStep: string;
  className?: string;
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
  return (
    <div className={clsx('flex flex-col space-y-2', className)}>
      <div className="flex w-full gap-2">
        {steps.map((step, stepIdx) => {
          const isCurrentStep = currentStep === step.id;
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
          return (
            <div key={step.name} className="flex-1">
              <div
                className={clsx(
                  'h-2 rounded-full',
                  isCompleted ? 'bg-indigo-600' : isCurrentStep ? 'bg-indigo-600' : 'bg-gray-200',
                  'transition-colors duration-300'
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="flex w-full gap-2">
        {steps.map((step, stepIdx) => {
          const isCurrentStep = currentStep === step.id;
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > stepIdx;
          return (
            <div
              key={step.name}
              className={clsx(
                'text-sm font-medium flex-1',
                isCompleted || isCurrentStep ? 'text-indigo-600' : 'text-gray-500'
              )}
            >
              {step.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
