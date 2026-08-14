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
    const handleClickOutside = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 -mr-2 min-h-[44px] px-2 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer touch-manipulation"
      >
        <span className="font-medium text-gray-700">{selectedLabel}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full right-0 mt-1.5 z-50 min-w-[200px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100"
        >
          {SORT_OPTIONS.map((option) => (
            <label
              key={option.value}
              role="option"
              aria-selected={sortBy === option.value}
              className="flex items-center gap-3 px-4 min-h-[44px] cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
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
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { entries, isLoading } = useFundraises();

  if (!isLoading && entries.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-end mt-1 sm:mt-3 -mb-1', className)}>
      <SortDropdown />
    </div>
  );
};
