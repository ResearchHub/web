'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface PillDropdownOption<T extends string = string> {
  label: string;
  value: T;
}

export interface PillDropdownProps<T extends string = string> {
  /** Displayed on the pill. Falls back to the selected option's label. */
  label?: string;
  options: PillDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PillDropdown<T extends string = string>({
  label,
  options,
  value,
  onChange,
  className,
}: PillDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const isDefault = value === options[0]?.value;
  const displayLabel = label && isDefault ? label : selectedOption?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 select-none whitespace-nowrap',
          !isDefault
            ? 'bg-gray-900 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        {displayLabel}
        {isOpen ? (
          <ChevronUp size={14} className={!isDefault ? 'text-gray-400' : 'text-gray-500'} />
        ) : (
          <ChevronDown size={14} className={!isDefault ? 'text-gray-400' : 'text-gray-500'} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  value === option.value ? 'border-primary-500' : 'border-gray-300'
                )}
              >
                {value === option.value && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </span>
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
