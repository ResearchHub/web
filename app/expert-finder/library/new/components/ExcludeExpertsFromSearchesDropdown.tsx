'use client';

import { useCallback, useState } from 'react';
import { UserMinus } from 'lucide-react';
import { ExpertSearchPicker } from './ExpertSearchPicker';
import type { ExpertSearchListItem } from '@/types/expertFinder';

export interface ExcludeExpertsFromSearchesDropdownProps {
  onExcludeChange: (excludedExpertNames: string) => void;
}

function getExcludedNamesString(selectedSearches: ExpertSearchListItem[]): string {
  const names = [...new Set(selectedSearches.flatMap((s) => s.expertNames ?? []).filter(Boolean))];
  return names.join(', ');
}

export function ExcludeExpertsFromSearchesDropdown({
  onExcludeChange,
}: ExcludeExpertsFromSearchesDropdownProps) {
  const [value, setValue] = useState<number[]>([]);

  const onChange = useCallback(
    (searchIds: number[], selectedSearches?: ExpertSearchListItem[]) => {
      setValue(searchIds);
      const names = selectedSearches ? getExcludedNamesString(selectedSearches) : '';
      onExcludeChange(names);
    },
    [onExcludeChange]
  );

  return (
    <ExpertSearchPicker
      mode="multi"
      value={value}
      onChange={onChange}
      label="Exclude Experts from Previous Searches"
      helperText="Select searches to exclude their experts from your new search results."
      placeholder="Select searches to exclude..."
      triggerIcon={<UserMinus className="h-4 w-4" />}
    />
  );
}
