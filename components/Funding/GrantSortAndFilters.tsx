'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { GRANT_SORT_OPTIONS, type GrantSortOption } from './lib/grantSortConfig';

function SortDropdown({
  sortBy,
  onSortChange,
}: {
  sortBy: GrantSortOption;
  onSortChange: (value: GrantSortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = GRANT_SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

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
        className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <span className="font-medium text-gray-700">{selectedLabel}</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {GRANT_SORT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                onSortChange(option.value);
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

interface GrantSortAndFiltersProps {
  className?: string;
  sortBy: GrantSortOption;
  onSortChange: (value: GrantSortOption) => void;
}

export const GrantSortAndFilters: FC<GrantSortAndFiltersProps> = ({
  className,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className={cn('flex items-center justify-end mt-2 sm:mt-4 mb-2', className)}>
      <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
    </div>
  );
};
