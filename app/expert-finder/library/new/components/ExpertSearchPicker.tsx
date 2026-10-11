'use client';

import { useState, useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { getSearchDisplayText } from '@/app/expert-finder/lib/utils';
import { ExpertSearchListItemDetail } from './ExpertSearchListItemDetail';
import { useExpertSearches } from '@/hooks/useExpertFinder';
import type { ExpertSearchListItem } from '@/types/expertFinder';
import { cn } from '@/utils/styles';

const LIST_LIMIT = 50;

export interface ExpertSearchPickerProps {
  mode: 'single' | 'multi';
  value: number[];
  onChange: (searchIds: number[], selectedSearches?: ExpertSearchListItem[]) => void;
  label: string;
  helperText?: string;
  placeholder?: string;
  triggerIcon?: React.ReactNode;
  disabled?: boolean;
  loadingLabel?: string;
}

export function ExpertSearchPicker({
  mode,
  value,
  onChange,
  label,
  helperText,
  placeholder,
  triggerIcon,
  disabled = false,
  loadingLabel,
}: ExpertSearchPickerProps) {
  const [{ searches, isLoading, error }, fetchSearches] = useExpertSearches({
    limit: LIST_LIMIT,
    offset: 0,
    immediate: false,
  });
  const [filterText, setFilterText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const hasFetchedWhenOpenRef = useRef(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (!open) {
        hasFetchedWhenOpenRef.current = false;
        return;
      }
      if (!hasFetchedWhenOpenRef.current && !isLoading && searches.length === 0) {
        hasFetchedWhenOpenRef.current = true;
        fetchSearches();
      }
    },
    [fetchSearches, isLoading, searches.length]
  );

  const filteredSearches = filterText.trim()
    ? searches.filter((s) =>
        getSearchDisplayText(s).toLowerCase().includes(filterText.toLowerCase())
      )
    : searches;

  const handleItemClick = useCallback(
    (search: ExpertSearchListItem) => {
      const id = search.searchId;
      if (mode === 'single') {
        const nextIds = value[0] === id ? [] : [id];
        const nextSearches = nextIds.length
          ? searches.filter((s) => s.searchId === nextIds[0])
          : [];
        onChange(nextIds, nextSearches);
        setIsOpen(false);
        return;
      }

      const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
      const nextSearches = searches.filter((s) => next.includes(s.searchId));
      onChange(next, nextSearches);
    },
    [mode, value, onChange, searches]
  );

  const handleClearSelection = useCallback(() => {
    onChange([], []);
  }, [onChange]);

  const selectedSearch = value[0] != null ? searches.find((s) => s.searchId === value[0]) : null;
  const hasSelection = value.length > 0;

  let triggerLabel: string;
  if (loadingLabel) {
    triggerLabel = loadingLabel;
  } else if (mode === 'single') {
    triggerLabel =
      selectedSearch != null ? getSearchDisplayText(selectedSearch) : (placeholder ?? '');
  } else if (value.length === 0) {
    triggerLabel = placeholder ?? '';
  } else {
    triggerLabel = `${value.length} item${value.length !== 1 ? 's' : ''} selected`;
  }

  const isItemSelected = (search: ExpertSearchListItem) => value.includes(search.searchId);

  // A popover rather than a menu: the filter field takes typing, which a menu
  // would claim for jumping between items, and multi mode stays open while
  // several searches are ticked.
  return (
    <div className="w-full">
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outlined"
            size="md"
            className="w-full justify-between text-left text-gray-900 font-normal"
            disabled={disabled || (isLoading && searches.length === 0 && !error)}
          >
            <span className="truncate text-sm">{triggerLabel}</span>
            {triggerIcon != null && (
              <span className="ml-2 shrink-0 text-gray-400">{triggerIcon}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex max-h-[360px] w-[var(--radix-popover-trigger-width)] flex-col overflow-hidden rounded-lg p-0">
          {isLoading && searches.length === 0 ? (
            <div className="py-6 px-4 text-center text-sm text-gray-500">
              Loading search history...
            </div>
          ) : error ? (
            <div className="py-3 px-4 text-sm text-red-600 bg-red-50 border-b border-red-100">
              {error}
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-gray-200 shrink-0">
                <Input
                  placeholder="Search by query text..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="overflow-y-auto max-h-72 py-1">
                {filteredSearches.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 px-2">
                    {filterText ? 'No items match your filter' : 'No items available'}
                  </p>
                ) : (
                  filteredSearches.map((search) => {
                    const isSelected = isItemSelected(search);
                    const itemContent = (
                      <>
                        {mode === 'multi' && (
                          <span
                            className={cn(
                              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-primary-600" />}
                          </span>
                        )}
                        <div className={mode === 'multi' ? 'min-w-0 flex-1' : undefined}>
                          <ExpertSearchListItemDetail search={search} />
                        </div>
                      </>
                    );
                    const itemClassName = cn(
                      'relative flex w-full cursor-pointer select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors text-left',
                      mode === 'single'
                        ? 'flex flex-col items-start gap-1 py-2 px-3'
                        : 'flex items-start gap-2 py-2 px-3',
                      isSelected && 'bg-primary-50 text-primary-900',
                      !isSelected && 'text-gray-700 hover:bg-gray-100'
                    );
                    return (
                      <button
                        key={search.searchId}
                        type="button"
                        onClick={() => handleItemClick(search)}
                        className={itemClassName}
                      >
                        {itemContent}
                      </button>
                    );
                  })
                )}
              </div>
              {hasSelection && (
                <div className="border-t border-gray-200 p-2 bg-gray-50 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="w-full text-xs text-gray-600 hover:text-gray-900"
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
