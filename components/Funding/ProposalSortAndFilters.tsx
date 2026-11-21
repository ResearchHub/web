'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { SortMenu } from '@/components/ui/SortMenu';
import { useFundraises } from '@/contexts/FundraiseContext';

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { entries, isLoading, sortBy, setSortBy, sortOptions } = useFundraises();

  if (!isLoading && entries.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-end', className)}>
      <SortMenu
        options={sortOptions}
        value={sortBy}
        onChange={setSortBy}
        triggerProps={{ 'data-testid': 'feed-sort-trigger' }}
      />
    </div>
  );
};
