'use client';

import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { SearchSortOption } from '@/types/search';

interface SearchSortControlsProps {
  sortBy: SearchSortOption;
  onSortChange: (sort: SearchSortOption) => void;
  activeTab: 'documents' | 'people';
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
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <SortDropdown
        value={sortBy}
        onChange={handleChange}
        options={sortOptions}
        className="min-w-[140px]"
      />
    </div>
  );
}
