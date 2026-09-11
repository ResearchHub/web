'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { SortMenu } from '@/components/ui/SortMenu';
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
    <div className={cn('flex items-center justify-end mt-1 sm:mt-3 -mb-1', className)}>
      <SortMenu
        options={GRANT_SORT_OPTIONS}
        value={sortBy}
        onChange={onSortChange}
        triggerVariant="touch"
        triggerProps={{ 'data-testid': 'feed-sort-trigger' }}
      />
    </div>
  );
};
