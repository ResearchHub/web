'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { cn } from '@/utils/styles';
import { MonoLabel } from './MonoLabel';
import { pipelineSteps, type PipelineStep } from './data/pipelineSteps';

interface StepIndicatorProps {
  step: PipelineStep;
  isActive: boolean;
  isDone: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}

const StepIndicator = ({ step, isActive, isDone, onClick, size = 'md' }: StepIndicatorProps) => {
  const isMd = size === 'md';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'step' : undefined}
      className={cn('group', isMd ? 'text-left' : 'flex flex-col items-center text-center')}
    >
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium transition-all border-2',
          isMd ? 'w-11 h-11 text-[13px]' : 'w-9 h-9 text-[12px]',
          isActive && 'bg-primary-500 border-primary-500 text-white scale-105',
          !isActive && isDone && 'bg-primary-500 border-primary-500 text-white',
          !isActive &&
            !isDone &&
            'bg-white border-gray-200 text-gray-500 group-hover:border-gray-900'
        )}
      >
        {isDone ? (
          <Check className={isMd ? 'w-4 h-4' : 'w-3.5 h-3.5'} aria-hidden />
        ) : (
          <MonoLabel>{step.number}</MonoLabel>
        )}
      </div>
      <div
        className={cn(
          'transition-colors',
          isMd
            ? 'mt-4 text-[15px] font-medium tracking-[-0.005em]'
            : 'mt-2 text-[11px] leading-tight',
          isActive ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-900'
        )}
      >
        {step.title}
      </div>
    </button>
  );
};

const StepDetailImage = ({ step }: { step: PipelineStep }) => (
  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-[220px]">
    <Image
      src={step.imageSrc}
      alt={step.imageAlt}
      fill
      sizes="(min-width: 768px) 360px, calc(100vw - 64px)"
      className="object-contain"
    />
  </div>
);

export const FundingPipeline = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = pipelineSteps[activeStepIndex];
  const totalSteps = pipelineSteps.length;
  const progress = totalSteps > 1 ? activeStepIndex / (totalSteps - 1) : 0;

  return (
    <div className="mt-8 sm:mt-12 md:mt-20">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <MonoLabel className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Funding pipeline
        </MonoLabel>
        <MonoLabel className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-500">
          {String(totalSteps).padStart(2, '0')} steps
        </MonoLabel>
      </div>

      {/* Desktop: horizontal stepper with detail card */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute top-[22px] left-[22px] right-[22px] h-px bg-gray-200" />
          <div
            className="absolute top-[22px] left-[22px] h-px bg-primary-500 transition-all duration-500"
            style={{ width: `calc((100% - 44px) * ${progress})` }}
          />
          <div className="grid grid-cols-4 gap-6 relative">
            {pipelineSteps.map((step, index) => (
              <StepIndicator
                key={step.number}
                step={step}
                isActive={index === activeStepIndex}
                isDone={index < activeStepIndex}
                onClick={() => setActiveStepIndex(index)}
                size="md"
              />
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="grid gap-8 grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] items-center">
            <div>
              <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-primary-500">
                Step {currentStep.number}
              </MonoLabel>
              <h4 className="mt-3 text-[32px] font-medium tracking-[-0.015em] text-gray-900">
                {currentStep.title}
              </h4>
              <p className="mt-4 text-base leading-[1.6] text-gray-500 max-w-2xl">
                {currentStep.description}
              </p>
            </div>
            <StepDetailImage step={currentStep} />
          </div>
        </div>
      </div>

      {/* Mobile: compact step selector with detail card */}
      <div className="md:hidden">
        <div className="relative">
          <div className="absolute top-[18px] left-[18px] right-[18px] h-px bg-gray-200" />
          <div
            className="absolute top-[18px] left-[18px] h-px bg-primary-500 transition-all duration-500"
            style={{ width: `calc((100% - 36px) * ${progress})` }}
          />
          <div className="relative grid grid-cols-4 gap-2">
            {pipelineSteps.map((step, index) => (
              <StepIndicator
                key={step.number}
                step={step}
                isActive={index === activeStepIndex}
                isDone={index < activeStepIndex}
                onClick={() => setActiveStepIndex(index)}
                size="sm"
              />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <MonoLabel className="text-[10px] uppercase tracking-[0.16em] text-primary-500">
            Step {currentStep.number}
          </MonoLabel>
          <h4 className="mt-2 font-medium text-[17px] text-gray-900 leading-snug">
            {currentStep.title}
          </h4>
          <div className="mt-3">
            <StepDetailImage step={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
};
