'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface RadioSortOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

interface RadioSortDropdownProps<TValue extends string> {
  ariaLabel: string;
  onChange: (value: TValue) => void;
  options: readonly RadioSortOption<TValue>[];
  value: TValue;
}

export function RadioSortDropdown<TValue extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: Readonly<RadioSortDropdownProps<TValue>>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const radioGroupName = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeWhenClickedOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeWhenClickedOutside);
    return () => document.removeEventListener('mousedown', closeWhenClickedOutside);
  }, []);

  if (!selectedOption) {
    return null;
  }

  const changeSort = (nextValue: TValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label={`${ariaLabel}: ${selectedOption.label}`}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex cursor-pointer items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700 sm:text-sm"
      >
        <span className="font-medium text-gray-700">{selectedOption.label}</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div
          role="radiogroup"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] animate-in rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg fade-in slide-in-from-top-1 duration-100"
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={radioGroupName}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => changeSort(option.value)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected ? 'border-primary-500' : 'border-gray-300'
                  )}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                </span>
                <span className="text-sm text-gray-800">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
