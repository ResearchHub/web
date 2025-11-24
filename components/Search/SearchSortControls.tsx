'use client';

import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { SearchSortOption } from '@/types/search';

interface SearchSortControlsProps {
  readonly sortBy: SearchSortOption;
  readonly onSortChange: (sort: SearchSortOption) => void;
  readonly activeTab: 'documents' | 'people';
}

export function SearchSortControls({ sortBy, onSortChange, activeTab }: SearchSortControlsProps) {
  const sortOptions: SortOption[] = [
    {
      value: 'relevance',
      label: 'Relevance',
    },
    {
      value: 'newest',
      label: 'Newest',
    },
  ];

  const handleChange = (option: SortOption) => {
    onSortChange(option.value as SearchSortOption);
  };

  return (
    <SortDropdown
      value={sortBy}
      onChange={handleChange}
      options={sortOptions}
      className="min-w-[140px]"
    />
  );
}
