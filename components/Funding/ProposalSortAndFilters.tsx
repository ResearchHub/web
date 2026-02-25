'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useFundraises } from '@/contexts/FundraiseContext';
import { SORT_OPTIONS, STATUS_OPTIONS } from './lib/proposalSortAndFilterConfig';

interface ProposalSortAndFiltersProps {
  className?: string;
}

function InlineDropdown<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label;

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
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1 text-base font-semibold text-black transition-colors border-b-2 border-black pb-0.5',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {selectedLabel}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
    </span>
  );
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { sortBy, setSortBy, statusFilter, setStatusFilter } = useFundraises();

  const isCompleted = statusFilter === 'completed';
  const effectiveSortBy = isCompleted ? 'newest' : sortBy;

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm text-gray-500',
        className
      )}
    >
      <span>Showing</span>
      <InlineDropdown options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
      <span>ordered by</span>
      <InlineDropdown
        options={SORT_OPTIONS}
        value={effectiveSortBy}
        onChange={setSortBy}
        disabled={isCompleted}
      />
    </div>
  );
};
