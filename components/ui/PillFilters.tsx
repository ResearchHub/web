'use client';

import React, { FC, ReactNode, useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowDown, Check } from 'lucide-react';
import { cn } from '@/utils/styles';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PillOption {
  label: string;
  value: string;
}

interface PillFilterDropdownProps {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  /** Renders a long vertical arrow instead of chevron (for sort pills) */
  isSort?: boolean;
  className?: string;
}

interface PillFilterToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  activeColor?: string; // e.g. 'bg-green-100 text-green-700 border-green-300'
  className?: string;
}

interface PillFilterBarProps {
  children: ReactNode;
  className?: string;
}

// ─── Dropdown Pill ───────────────────────────────────────────────────────────

export const PillFilterDropdown: FC<PillFilterDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  isSort = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeOption = options.find((o) => o.value === value);
  const hasNonDefaultSelection = activeOption && activeOption.value !== options[0]?.value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border',
          hasNonDefaultSelection
            ? 'bg-gray-800 text-white border-gray-800'
            : 'bg-gray-100 text-gray-700 border-gray-100 hover:bg-gray-200',
          className
        )}
      >
        <span>{hasNonDefaultSelection ? activeOption.label : label}</span>
        {isSort ? (
          <ArrowDown className="w-3.5 h-3.5" strokeWidth={2.5} />
        ) : (
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-50 min-w-[200px]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3.5 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    value === option.value ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  )}
                >
                  {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span
                  className={cn(
                    value === option.value ? 'font-medium text-gray-900' : 'text-gray-700'
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Toggle Pill (binary state) ──────────────────────────────────────────────

export const PillFilterToggle: FC<PillFilterToggleProps> = ({
  label,
  isActive,
  onToggle,
  activeColor = 'bg-green-100 text-green-700 border-green-300',
  className,
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border',
        isActive ? activeColor : 'bg-gray-100 text-gray-700 border-gray-100 hover:bg-gray-200',
        className
      )}
    >
      {isActive && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
      <span>{label}</span>
    </button>
  );
};

// ─── Pill Filter Bar (container) ─────────────────────────────────────────────

export const PillFilterBar: FC<PillFilterBarProps> = ({ children, className }) => {
  return <div className={cn('flex items-center gap-2 flex-wrap', className)}>{children}</div>;
};
