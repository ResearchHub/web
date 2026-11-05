'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { SortMenu } from '@/components/ui/SortMenu';
import { useFundraises } from '@/contexts/FundraiseContext';
import { SORT_OPTIONS } from './lib/proposalSortAndFilterConfig';

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { entries, isLoading, sortBy, setSortBy } = useFundraises();

  if (!isLoading && entries.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-end mt-1 sm:mt-3 -mb-1', className)}>
      <SortMenu
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={setSortBy}
        triggerVariant="touch"
        triggerProps={{ 'data-testid': 'feed-sort-trigger' }}
      />
    </div>
  );
};
