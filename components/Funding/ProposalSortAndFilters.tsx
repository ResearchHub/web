'use client';

import { FC } from 'react';
import { PillDropdown } from '@/components/ui/nav/PillDropdown';
import { useProposalList } from '@/contexts/ProposalListContext';
import { SORT_OPTIONS, STATUS_OPTIONS } from './lib/proposalSortAndFilterConfig';
import type { ProposalSortOption, ProposalStatusFilter } from './lib/proposalSortAndFilterConfig';

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { sortBy, setSortBy, statusFilter, setStatusFilter } = useProposalList();

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <PillDropdown<ProposalStatusFilter>
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
      />
      <PillDropdown<ProposalSortOption>
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={setSortBy}
      />
    </div>
  );
};
