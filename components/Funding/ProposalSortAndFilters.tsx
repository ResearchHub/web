'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { useFundraises } from '@/contexts/FundraiseContext';
import { SORT_OPTIONS } from './lib/proposalSortAndFilterConfig';

function SortDropdown() {
  const { sortBy, setSortBy } = useFundraises();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

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
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-sm sm:text-base text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <span className="font-medium text-gray-700">{selectedLabel}</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {SORT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                setSortBy(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  sortBy === option.value ? 'border-primary-500' : 'border-gray-300'
                )}
              >
                {sortBy === option.value && (
                  <span className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </span>
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </span>
  );
}

interface ProposalSortAndFiltersProps {
  className?: string;
  /** "all" = /fund page, "grant" = /grant/[id] page */
  variant?: 'all' | 'grant';
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({
  className,
  variant = 'all',
}) => {
  const { entries, isLoading } = useFundraises();

  const label =
    variant === 'grant' ? (
      <>
        <span className="font-semibold">
          {entries.length} proposal{entries.length !== 1 ? 's' : ''}
        </span>{' '}
        competing for funding
      </>
    ) : (
      <span>
        <span className="hidden sm:inline">Showing </span>
        <span className="font-semibold">all proposals</span> seeking funding
      </span>
    );

  return (
    <div className={cn('flex items-center justify-between mt-3 sm:mt-6 mb-2', className)}>
      {isLoading ? (
        <div className="h-5 w-52 rounded bg-gray-200 animate-pulse" />
      ) : (
        <p className="text-sm sm:text-base text-gray-600">{label}</p>
      )}
      <SortDropdown />
    </div>
  );
};
