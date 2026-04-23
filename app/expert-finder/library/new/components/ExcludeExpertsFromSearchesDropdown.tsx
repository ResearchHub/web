'use client';

import { useCallback } from 'react';
import { UserMinus } from 'lucide-react';
import { ExpertSearchPicker } from './ExpertSearchPicker';

export interface ExcludeExpertsFromSearchesDropdownProps {
  value: number[];
  onExcludeChange: (excludedSearchIds: number[]) => void;
}

export function ExcludeExpertsFromSearchesDropdown({
  value,
  onExcludeChange,
}: ExcludeExpertsFromSearchesDropdownProps) {
  const onChange = useCallback(
    (searchIds: number[]) => {
      onExcludeChange(searchIds);
    },
    [onExcludeChange]
  );

  return (
    <ExpertSearchPicker
      mode="multi"
      value={value}
      onChange={onChange}
      label="Exclude results from previous searches"
      helperText="Experts found in the selected searches will be excluded from this run."
      placeholder="Select searches to exclude…"
      triggerIcon={<UserMinus className="h-4 w-4" />}
    />
  );
}
