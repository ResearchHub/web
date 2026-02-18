'use client';

import { FC } from 'react';
import { PillDropdown } from '@/components/ui/nav/PillDropdown';
import { PillBinary } from '@/components/ui/nav/PillBinary';
import {
  STATUS_OPTIONS,
  SORT_OPTIONS,
  type ProposalStatusFilter,
  type ProposalSortOption,
} from './lib/proposalSortAndFilterConfig';
import { useProposalList } from '@/contexts/ProposalListContext';

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { statusFilter, setStatusFilter, taxDeductible, setTaxDeductible, sortBy, setSortBy } =
    useProposalList();

  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        <PillDropdown<ProposalStatusFilter>
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <PillBinary label="Tax deductible" active={taxDeductible} onChange={setTaxDeductible} />
        <PillDropdown<ProposalSortOption>
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>
    </div>
  );
};
