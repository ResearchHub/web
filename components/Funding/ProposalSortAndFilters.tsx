'use client';

import { FC } from 'react';
import { ChevronDown, Star, Clock, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useProposalList } from '@/contexts/ProposalListContext';
import type { ProposalSortOption } from './lib/proposalSortAndFilterConfig';

type SortOption = {
  label: string;
  value: ProposalSortOption;
  icon: typeof Star;
};

const sortOptions: SortOption[] = [
  { label: 'Best', value: 'best', icon: Star },
  { label: 'Newest', value: 'newest', icon: Clock },
  { label: 'Top', value: 'upvotes', icon: ArrowUp },
];

interface ProposalSortAndFiltersProps {
  className?: string;
}

export const ProposalSortAndFilters: FC<ProposalSortAndFiltersProps> = ({ className }) => {
  const { sortBy, setSortBy } = useProposalList();

  const currentSortOption = sortOptions.find((opt) => opt.value === sortBy);
  const SortIcon = currentSortOption?.icon ?? Star;

  return (
    <div className={`flex justify-end ${className ?? ''}`}>
      <BaseMenu
        align="end"
        trigger={
          <Button variant="outlined" size="sm" className="flex items-center gap-1">
            <SortIcon className="h-4 w-4 mr-1" />
            <span>{currentSortOption?.label ?? 'Sort'}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        }
      >
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <BaseMenuItem
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={sortBy === option.value ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </BaseMenuItem>
          );
        })}
      </BaseMenu>
    </div>
  );
};
