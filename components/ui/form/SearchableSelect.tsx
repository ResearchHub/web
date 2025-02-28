import { Fragment, useEffect, useState, useId, useCallback, ReactNode, ReactElement } from 'react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { Check, ChevronDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/utils/styles';
import { debounce } from 'lodash';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface SelectOption<T = any> {
  value: string;
  label: string;
  data?: T; // Now data will be of type T
}

export interface SearchableSelectProps<T = any> {
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
}

export function SearchableSelect<T = any>({
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
}: SearchableSelectProps<T>) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SelectOption<T>[]>(staticOptions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    } else {
      setOptions(staticOptions || []);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch, staticOptions]);

  const handleChange = (newValue: SelectOption<T> | null) => {
    setQuery('');
    onChange(newValue);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
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
      <Combobox value={value} onChange={handleChange} disabled={disabled} nullable>
        <div className="relative">
          <div
            className={cn(
              'relative flex items-center w-full border border-gray-200 rounded-lg bg-white p-1.5 text-left transition-colors',
              error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
              !disabled &&
                'focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400',
              disabled && 'bg-gray-50 cursor-not-allowed',
              className
            )}
          >
            <ComboboxInput
              id={id}
              autoComplete="off"
              className="w-full bg-transparent border-none p-1 text-sm outline-none"
              placeholder={!value ? placeholder : ''}
              onChange={(e) => {
                setQuery(e.target.value.trim());
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              displayValue={(option: SelectOption<T> | null) => option?.label || query}
            />
            {value && clearable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="text-gray-400 hover:text-gray-600 mr-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />}
            <ComboboxButton className="flex-shrink-0">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </ComboboxButton>
          </div>

          {isOpen && (
            <ComboboxOptions
              className="absolute z-10 mt-1 w-full p-2 overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60"
              static
            >
              {(() => {
                if (query.length < minSearchLength && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Type to search...</div>;
                }

                if (isLoading && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>;
                }

                if (!isLoading && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">No options found</div>;
                }

                return options.map((option) => (
                  <ComboboxOption key={option.value} value={option}>
                    {({ focus, selected }) =>
                      renderOption ? (
                        renderOption(option, { selected, focus })
                      ) : (
                        <li
                          className={cn(
                            'relative cursor-pointer select-none py-2 px-3 rounded-md text-sm',
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
                      )
                    }
                  </ComboboxOption>
                ));
              })()}
            </ComboboxOptions>
          )}
        </div>
      </Combobox>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
}
