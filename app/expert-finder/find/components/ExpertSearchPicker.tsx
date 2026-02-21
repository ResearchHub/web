'use client';

import { useState, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ExpertSearchListItemDetail, getSearchDisplayText } from './ExpertSearchListItemDetail';
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
}

export function ExpertSearchPicker({
  mode,
  value,
  onChange,
  label,
  helperText,
  placeholder,
  triggerIcon,
}: ExpertSearchPickerProps) {
  const [{ searches, isLoading, error }, fetchSearches] = useExpertSearches({
    limit: LIST_LIMIT,
    offset: 0,
    immediate: false,
  });
  const [filterText, setFilterText] = useState('');

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && searches.length === 0 && !isLoading) {
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

  const triggerLabel =
    mode === 'single'
      ? selectedSearch
        ? getSearchDisplayText(selectedSearch)
        : placeholder
      : value.length === 0
        ? placeholder
        : `${value.length} item${value.length !== 1 ? 's' : ''} selected`;

  const isItemSelected = (search: ExpertSearchListItem) => value.includes(search.searchId);

  return (
    <Dropdown
      label={label}
      helperText={helperText}
      onOpenChange={handleOpenChange}
      trigger={
        <Button
          type="button"
          variant="outlined"
          size="md"
          className="w-full justify-between text-left text-gray-900 font-normal"
          disabled={isLoading && searches.length === 0 && !error}
        >
          <span className="truncate text-sm">{triggerLabel}</span>
          {triggerIcon != null && (
            <span className="ml-2 shrink-0 text-gray-400">{triggerIcon}</span>
          )}
        </Button>
      }
      className="max-h-[360px] overflow-hidden flex flex-col p-0 w-[var(--button-width)]"
    >
      <div className="flex flex-col overflow-hidden">
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
                  return mode === 'single' ? (
                    <DropdownItem
                      key={search.searchId}
                      onClick={() => handleItemClick(search)}
                      className={itemClassName}
                    >
                      {itemContent}
                    </DropdownItem>
                  ) : (
                    <button
                      key={search.searchId}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleItemClick(search);
                      }}
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
      </div>
    </Dropdown>
  );
}
