'use client';

import { FC } from 'react';
import { PillDropdown } from '@/components/ui/nav/PillDropdown';
import { useFundraises } from '@/contexts/FundraiseContext';
import { SORT_OPTIONS, STATUS_OPTIONS } from './lib/proposalSortAndFilterConfig';
import type { ProposalSortOption, ProposalStatusFilter } from './lib/proposalSortAndFilterConfig';

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { sortBy, setSortBy, statusFilter, setStatusFilter } = useFundraises();

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <PillDropdown<ProposalStatusFilter>
        options={STATUS_OPTIONS}
        value={statusFilter}
        size="md"
        onChange={setStatusFilter}
      />
      <PillDropdown<ProposalSortOption>
        options={SORT_OPTIONS}
        value={sortBy}
        size="md"
        onChange={setSortBy}
      />
    </div>
  );
};
