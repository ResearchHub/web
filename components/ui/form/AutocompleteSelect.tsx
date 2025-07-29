import { useEffect, useState, useId, useCallback, ReactElement } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { Check, X, Loader2, Plus } from 'lucide-react';
import { cn } from '@/utils/styles';
import { debounce } from 'lodash';
import { Button } from '@/components/ui/Button';

export interface SelectOption<T = any> {
  value: string;
  label: string;
  data?: T;
}

export interface AutocompleteSelectProps<T = any> {
  value: SelectOption<T> | null;
  onChange: (value: SelectOption<T> | null) => void;
  onSearch?: (query: string) => Promise<SelectOption<T>[]>;
  options?: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
  minSearchLength?: number;
  clearable?: boolean;
  renderOption?: (
    option: SelectOption<T>,
    props: { selected: boolean; focus: boolean }
  ) => ReactElement;
  renderSelectedValue?: (option: SelectOption<T>) => ReactElement;
  allowCreatingNew?: boolean;
  onCreateNew?: (query: string) => Promise<SelectOption<T> | null>;
  createNewLabel?: string;
}

export function AutocompleteSelect<T = any>({
  options: staticOptions,
  value,
  onChange,
  onSearch,
  label,
  placeholder = 'Select an option...',
  error,
  helperText,
  required,
  className,
  debounceMs = 300,
  disabled,
  minSearchLength = 2,
  clearable = true,
  renderOption,
  renderSelectedValue,
  allowCreatingNew = false,
  onCreateNew,
  createNewLabel = 'Add new',
}: AutocompleteSelectProps<T>) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SelectOption<T>[]>(staticOptions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!onSearch || searchQuery.length < minSearchLength) {
        setOptions(staticOptions || []);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await onSearch(searchQuery);
        setOptions(results);
      } catch (error) {
        console.error('Search failed:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [onSearch, staticOptions, minSearchLength, debounceMs, setOptions, setIsLoading]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch, staticOptions]);

  const handleChange = (newValue: SelectOption<T> | null) => {
    // Special case for "create new" option
    if (newValue && newValue.value === '__create_new__') {
      handleCreateNew();
      return;
    }

    setQuery('');
    onChange(newValue);
  };

  const handleCreateNew = async () => {
    if (!onCreateNew || !query) return;

    try {
      setIsCreatingNew(true);
      const newOption = await onCreateNew(query);

      if (newOption) {
        onChange(newOption);
        setQuery('');
      }
    } catch (error) {
      console.error('Failed to create new option:', error);
    } finally {
      setIsCreatingNew(false);
    }
  };

  const clearSelection = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onChange(null);
  };

  const showCustomValue = value && renderSelectedValue && query.length === 0;

  // Create the "Add new" option
  const createNewOption: SelectOption<T> = {
    value: '__create_new__',
    label: `${createNewLabel} "${query}"`,
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-700 mb-1 cursor-pointer"
        >
          {label} {required && <span className="text-gray-700">*</span>}
        </label>
      )}
      <Combobox value={value} onChange={handleChange} disabled={disabled} by="value">
        <label htmlFor={id} className="block relative">
          <div
            className={cn(
              'relative w-full border border-gray-200 rounded-lg bg-white text-left transition-colors',
              error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
              !disabled &&
                'focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400',
              disabled && 'bg-gray-50 cursor-not-allowed',
              className
            )}
          >
            {showCustomValue ? (
              <>
                <div className="absolute inset-0 flex items-center p-1.5 z-0">
                  <ComboboxInput
                    id={id}
                    autoComplete="off"
                    className="w-full bg-transparent border-none p-1 text-sm outline-none"
                    onChange={(e) => {
                      setQuery(e.target.value.trim());
                    }}
                  />
                </div>
                <div className="relative z-10 p-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-50 p-2 rounded-md max-w-[calc(100%-48px)]">
                      {renderSelectedValue(value)}
                    </div>

                    {clearable && (
                      <Button
                        type="button"
                        onClick={clearSelection}
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Regular input display when no custom value */
              <div className="flex items-center p-1.5">
                <ComboboxInput
                  id={id}
                  autoComplete="off"
                  className="w-full bg-transparent border-none p-1 text-sm outline-none"
                  placeholder={placeholder}
                  onChange={(e) => {
                    setQuery(e.target.value.trim());
                  }}
                  onBlur={() => {
                    if (!isCreatingNew) {
                      setQuery('');
                    }
                  }}
                  displayValue={(option: SelectOption<T> | null) =>
                    option && !query ? option.label : query
                  }
                />
                {(isLoading || isCreatingNew) && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                )}
              </div>
            )}
          </div>

          {query.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 w-full p-2 overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60">
              {(() => {
                if (query.length < minSearchLength && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Type to search...</div>;
                }

                if (isLoading && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>;
                }

                if (!isLoading && options.length === 0 && !allowCreatingNew) {
                  return <div className="px-4 py-2 text-sm text-gray-500">No options found</div>;
                }

                const displayOptions = [...options];

                // Add "create new" option if enabled and we have a query
                if (allowCreatingNew && query.length >= minSearchLength && onCreateNew) {
                  displayOptions.push(createNewOption);
                }

                return displayOptions.map((option) => (
                  <ComboboxOption key={option.value} value={option}>
                    {({ focus, selected }) => {
                      // Special rendering for "create new" option
                      if (option.value === '__create_new__') {
                        return (
                          <li
                            className={cn(
                              'relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none',
                              focus ? 'bg-gray-100' : 'text-gray-900'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{option.label}</span>
                            </div>
                          </li>
                        );
                      }

                      // Regular option rendering
                      return renderOption ? (
                        renderOption(option, { selected, focus })
                      ) : (
                        <li
                          className={cn(
                            'relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none',
                            focus ? 'bg-gray-100' : 'text-gray-900'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={selected ? 'font-medium' : 'font-normal'}>
                              {option.label}
                            </span>
                            {selected && <Check className="h-4 w-4 text-blue-500" />}
                          </div>
                        </li>
                      );
                    }}
                  </ComboboxOption>
                ));
              })()}
            </ComboboxOptions>
          )}
        </label>
      </Combobox>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
