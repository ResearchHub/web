'use client';

import { FC } from 'react';
import { RadioSortDropdown } from '@/components/ui/RadioSortDropdown';
import { cn } from '@/utils/styles';
import { GRANT_SORT_OPTIONS, type GrantSortOption } from './lib/grantSortConfig';

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
      <RadioSortDropdown
        ariaLabel="Sort funding opportunities"
        options={GRANT_SORT_OPTIONS}
        value={sortBy}
        onChange={onSortChange}
      />
    </div>
  );
};
