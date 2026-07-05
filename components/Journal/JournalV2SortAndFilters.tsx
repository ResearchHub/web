'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';

export type JournalSortOption = 'best' | 'newest' | 'peer_review_score';

export const JOURNAL_SORT_OPTIONS: ReadonlyArray<{
  readonly label: string;
  readonly value: JournalSortOption;
}> = [
  { label: 'Best', value: 'best' },
  { label: 'Newest', value: 'newest' },
  { label: 'Review score', value: 'peer_review_score' },
];

interface SortDropdownProps {
  readonly sortBy: JournalSortOption;
  readonly onSortChange: (value: JournalSortOption) => void;
}

function SortDropdown({ sortBy, onSortChange }: Readonly<SortDropdownProps>) {
  return (
    <select
      aria-label="Sort journal entries"
      value={sortBy}
      onChange={(event) => onSortChange(event.target.value as JournalSortOption)}
      className="cursor-pointer bg-transparent pr-1 text-xs font-medium text-gray-700 outline-none transition-colors hover:text-gray-900 sm:text-sm"
    >
      {JOURNAL_SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface JournalV2SortAndFiltersProps {
  readonly className?: string;
  readonly sortBy: JournalSortOption;
  readonly onSortChange: (value: JournalSortOption) => void;
}

export const JournalV2SortAndFilters: FC<JournalV2SortAndFiltersProps> = ({
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
