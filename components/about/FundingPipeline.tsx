'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/styles';
import { MonoLabel } from './MonoLabel';
import { pipelineSteps } from './data/pipelineSteps';

const ProductImagePlaceholder = ({ stepNumber }: { stepNumber: string }) => (
  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white/70 min-h-[170px] md:min-h-[220px]">
    <div
      aria-hidden
      className="absolute inset-0 opacity-60"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(148,163,184,0.18) 0, rgba(148,163,184,0.18) 1px, transparent 1px, transparent 14px)',
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-primary-50/70" />
    <MonoLabel className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.18em] text-gray-500">
      Fig. step-{stepNumber} · Product image
    </MonoLabel>
  </div>
);

export const FundingPipeline = () => {
  const [active, setActive] = useState(0);
  const current = pipelineSteps[active];
  const total = pipelineSteps.length;
  const progress = total > 1 ? active / (total - 1) : 0;

  return (
    <div className="mt-8 sm:mt-12 md:mt-20">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <MonoLabel className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Funding pipeline
        </MonoLabel>
        <MonoLabel className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-gray-500">
          {String(total).padStart(2, '0')} steps
        </MonoLabel>
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute top-[22px] left-[22px] right-[22px] h-px bg-gray-200" />
          <div
            className="absolute top-[22px] left-[22px] h-px bg-primary-500 transition-all duration-500"
            style={{ width: `calc((100% - 44px) * ${progress})` }}
          />
          <div className="grid grid-cols-4 gap-6 relative">
            {pipelineSteps.map((step, index) => {
              const isActive = index === active;
              const isDone = index < active;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isActive ? 'step' : undefined}
                  className="group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-medium transition-all border-2',
                        isActive && 'bg-primary-500 border-primary-500 text-white scale-105',
                        !isActive && isDone && 'bg-primary-500 border-primary-500 text-white',
                        !isActive &&
                          !isDone &&
                          'bg-white border-gray-200 text-gray-500 group-hover:border-gray-900'
                      )}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" aria-hidden />
                      ) : (
                        <MonoLabel>{step.number}</MonoLabel>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      'mt-4 text-[15px] font-medium tracking-[-0.005em] transition-colors',
                      isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'
                    )}
                  >
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-primary-50 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] md:items-center">
            <div>
              <MonoLabel className="text-[11px] uppercase tracking-[0.16em] text-primary-500">
                Step {current.number}
              </MonoLabel>
              <h4 className="mt-3 text-[28px] md:text-[32px] font-medium tracking-[-0.015em] text-gray-900">
                {current.title}
              </h4>
              <p className="mt-4 text-[16px] leading-[1.6] text-gray-500 max-w-2xl">
                {current.description}
              </p>
            </div>
            <ProductImagePlaceholder stepNumber={current.number} />
          </div>
        </div>
      </div>

      {/* Mobile: vertical stepper with thin connector line */}
      <div className="md:hidden relative">
        <div aria-hidden className="absolute left-5 top-5 bottom-5 w-px bg-gray-200" />
        <ol className="space-y-2.5 sm:space-y-4">
          {pipelineSteps.map((step) => (
            <li
              key={step.number}
              className="relative border border-gray-200 rounded-xl p-4 bg-white"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="relative z-10 w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center text-[13px] flex-shrink-0">
                  <MonoLabel>{step.number}</MonoLabel>
                </span>
                <h4 className="font-medium text-[16px] sm:text-[17px] text-gray-900 leading-snug">
                  {step.title}
                </h4>
              </div>
              <p className="mt-2 text-[14px] sm:text-[15px] text-gray-500 leading-[1.55]">
                {step.description}
              </p>
              <div className="mt-3">
                <ProductImagePlaceholder stepNumber={step.number} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
