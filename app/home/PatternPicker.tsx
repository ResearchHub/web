'use client';

import { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';
import { cn } from '@/utils/styles';
import {
  HOME_VARIATIONS,
  SCOPE_PATTERNS,
  type HomeVariation,
  type HomeVariationState,
  type ScopePattern,
} from './useHomeScope';

interface PatternPickerProps {
  pattern: ScopePattern;
  onPatternChange: (pattern: ScopePattern) => void;
  variations: HomeVariationState;
  onVariationToggle: (variation: HomeVariation) => void;
}

/**
 * Demo-only control for comparing the candidate "mine vs everything" switches
 * against each other in situ, plus the layout variations that ride alongside
 * them. Not part of the shipping surface — once a pattern is picked this
 * component and the alternatives it selects go away.
 */
export function PatternPicker({
  pattern,
  onPatternChange,
  variations,
  onVariationToggle,
}: PatternPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const active = SCOPE_PATTERNS.find((p) => p.id === pattern);
  const activeVariationCount = HOME_VARIATIONS.filter((v) => variations[v.id]).length;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 hidden items-center gap-2 rounded-full border border-gray-200 bg-white py-2 pl-3 pr-4 text-[13px] font-semibold text-gray-700 shadow-lg transition-colors hover:bg-gray-50 xl:!flex"
      >
        <FlaskConical size={15} className="text-primary-600" />
        Pattern: {active?.label}
        {activeVariationCount > 0 && <span className="text-gray-400">+{activeVariationCount}</span>}
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 hidden w-[320px] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl xl:!block">
      <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Scope switch pattern
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close pattern picker"
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-0.5">
        {SCOPE_PATTERNS.map((option) => {
          const isActive = option.id === pattern;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPatternChange(option.id)}
              className={cn(
                'block w-full rounded-xl px-2.5 py-2 text-left transition-colors',
                isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-primary-800' : 'text-gray-900'
                  )}
                >
                  {option.label}
                </span>
                <span className="shrink-0 text-[11px] text-gray-400">{option.precedent}</span>
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-gray-500">
                {option.blurb}
              </span>
            </button>
          );
        })}
      </div>

      {/* Independent of the pattern above: each one moves or restyles one piece
          of chrome, so they stack rather than replace each other. */}
      <div className="mt-1.5 border-t border-gray-100 pt-1.5">
        <span className="block px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Variations
        </span>
        <div className="space-y-0.5">
          {HOME_VARIATIONS.map((variation) => (
            <VariationRow
              key={variation.id}
              label={variation.label}
              blurb={variation.blurb}
              isOn={variations[variation.id]}
              onToggle={() => onVariationToggle(variation.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface VariationRowProps {
  label: string;
  blurb: string;
  isOn: boolean;
  onToggle: () => void;
}

function VariationRow({ label, blurb, isOn, onToggle }: VariationRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={onToggle}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors',
        isOn ? 'bg-primary-50' : 'hover:bg-gray-50'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors',
          isOn ? 'bg-primary-600' : 'bg-gray-300'
        )}
      >
        <span
          className={cn(
            'h-3 w-3 rounded-full bg-white transition-transform',
            isOn && 'translate-x-3'
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn('block text-sm font-semibold', isOn ? 'text-primary-800' : 'text-gray-900')}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-gray-500">{blurb}</span>
      </span>
    </button>
  );
}
