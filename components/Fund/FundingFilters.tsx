'use client';

import React, { FC } from 'react';
import { PillFilterBar, PillFilterDropdown, PillFilterToggle } from '@/components/ui/PillFilters';
import { FundingSortOption } from './MarketplaceTabs';
import { getSortOptions } from './lib/FundingFeedConfig';
import type { MarketplaceTab } from './MarketplaceTabs';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Funding completed', value: 'completed' },
];

const PEER_REVIEW_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Peer reviewed', value: 'reviewed' },
  { label: 'Needs review', value: 'needs-review' },
];

interface FundingFiltersProps {
  activeTab: MarketplaceTab;
  status: string;
  onStatusChange: (value: string) => void;
  peerReview: string;
  onPeerReviewChange: (value: string) => void;
  taxDeductible: boolean;
  onTaxDeductibleToggle: () => void;
  sortBy: FundingSortOption;
  onSortChange: (value: FundingSortOption) => void;
}

export const FundingFilters: FC<FundingFiltersProps> = ({
  activeTab,
  status,
  onStatusChange,
  peerReview,
  onPeerReviewChange,
  taxDeductible,
  onTaxDeductibleToggle,
  sortBy,
  onSortChange,
}) => {
  const rawSortOptions = getSortOptions(activeTab);
  const sortPillOptions = rawSortOptions.map((opt) => ({
    label: opt.label,
    value: opt.value || 'default',
  }));

  return (
    <PillFilterBar className="py-3">
      <PillFilterDropdown
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={onStatusChange}
      />
      <PillFilterDropdown
        label="Peer Review"
        options={PEER_REVIEW_OPTIONS}
        value={peerReview}
        onChange={onPeerReviewChange}
      />
      <PillFilterToggle
        label="Tax deductible"
        isActive={taxDeductible}
        onToggle={onTaxDeductibleToggle}
      />
      <PillFilterDropdown
        label={sortPillOptions.find((o) => o.value === (sortBy || 'default'))?.label || 'Sort'}
        options={sortPillOptions}
        value={sortBy || 'default'}
        onChange={(val) => onSortChange((val === 'default' ? '' : val) as FundingSortOption)}
        isSort
      />
    </PillFilterBar>
  );
};
