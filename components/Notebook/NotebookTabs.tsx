'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/styles';

export type NotebookTab = 'document' | 'details';

interface NotebookTabsProps {
  active: NotebookTab;
  onChange: (tab: NotebookTab) => void;
}

const STEPS: { id: NotebookTab; label: string; dataTour?: string }[] = [
  { id: 'document', label: 'Document' },
  { id: 'details', label: 'Details', dataTour: 'notebook-publish' },
];

/** Linear two-step flow shown in the notebook top bar. It reads as a sequence
 *  (Document → Details) rather than parallel tabs, so the progression toward
 *  publishing is visually explicit. */
export function NotebookTabs({ active, onChange }: NotebookTabsProps) {
  const activeIndex = STEPS.findIndex((step) => step.id === active);

  return (
    <nav aria-label="Note progress" className="inline-flex items-center gap-1.5">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center gap-1.5">
          <Step
            index={index}
            label={step.label}
            state={
              index === activeIndex ? 'current' : index < activeIndex ? 'complete' : 'upcoming'
            }
            onClick={() => onChange(step.id)}
            dataTour={step.dataTour}
          />
          {index < STEPS.length - 1 && (
            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
          )}
        </div>
      ))}
    </nav>
  );
}

type StepState = 'current' | 'complete' | 'upcoming';

function Step({
  index,
  label,
  state,
  onClick,
  dataTour,
}: Readonly<{
  index: number;
  label: string;
  state: StepState;
  onClick: () => void;
  dataTour?: string;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={dataTour}
      aria-current={state === 'current' ? 'step' : undefined}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors',
        state === 'current' ? 'bg-primary-50' : 'hover:bg-gray-100'
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          state === 'current' && 'bg-primary-500 text-white',
          state === 'complete' && 'bg-primary-100 text-primary-700',
          state === 'upcoming' && 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
        )}
      >
        {index + 1}
      </span>
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          state === 'current' ? 'text-primary-700' : 'text-gray-500 group-hover:text-gray-700'
        )}
      >
        {label}
      </span>
    </button>
  );
}
