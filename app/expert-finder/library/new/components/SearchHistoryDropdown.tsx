'use client';

import { useCallback, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { ExpertFinderService } from '@/services/expertFinder.service';
import { ExpertSearchPicker } from './ExpertSearchPicker';
import type { ExpertSearchResult } from '@/types/expertFinder';

export interface SearchHistoryDropdownProps {
  onSearchSelect: (search: ExpertSearchResult | null) => void;
  selectedSearchId: number | null;
  onLoadingChange?: (loading: boolean) => void;
}

export function SearchHistoryDropdown({
  onSearchSelect,
  selectedSearchId,
  onLoadingChange,
}: SearchHistoryDropdownProps) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const value = selectedSearchId != null ? [selectedSearchId] : [];

  const setLoading = useCallback(
    (loading: boolean) => {
      setIsLoadingDetails(loading);
      onLoadingChange?.(loading);
    },
    [onLoadingChange]
  );

  const onChange = useCallback(
    async (searchIds: number[]) => {
      if (searchIds.length === 0) {
        onSearchSelect(null);
        return;
      }
      setLoading(true);
      try {
        const full = await ExpertFinderService.getSearch(searchIds[0]);
        onSearchSelect(full);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load search details';
        console.error(message);
        onSearchSelect(null);
      } finally {
        setLoading(false);
      }
    },
    [onSearchSelect, setLoading]
  );

  return (
    <ExpertSearchPicker
      mode={'single'}
      value={value}
      onChange={onChange}
      label="Re-run Previous Search"
      helperText="Select a previous search to load its query and configuration."
      placeholder="Select a previous search..."
      triggerIcon={<RotateCcw className="h-4 w-4" />}
      disabled={isLoadingDetails}
      loadingLabel={isLoadingDetails ? 'Loading search...' : undefined}
    />
  );
}
