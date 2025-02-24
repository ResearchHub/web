import { Fragment, useCallback, useEffect, useState, useId } from 'react';
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

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface SearchableMultiSelectProps {
  value: MultiSelectOption[];
  onChange: (value: MultiSelectOption[]) => void;
  onSearch?: (query: string) => Promise<MultiSelectOption[]>;
  options?: MultiSelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  debounceMs?: number;
  disabled?: boolean;
  minSearchLength?: number;
}

export function SearchableMultiSelect({
  options: staticOptions,
  value,
  onChange,
  onSearch,
  label,
  placeholder = 'Select options...',
  error,
  helperText,
  required,
  className,
  debounceMs = 300,
  disabled,
  minSearchLength = 2,
}: SearchableMultiSelectProps) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [focusedValueIndex, setFocusedValueIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<MultiSelectOption[]>(staticOptions || []);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!onSearch || query.length < minSearchLength) return;

      try {
        const results = await onSearch(query);
        setOptions(results);
      } catch (error) {
        console.error('Search failed:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [onSearch, debounceMs, minSearchLength]
  );

  useEffect(() => {
    if (onSearch && query.length >= minSearchLength) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setIsLoading(false);
      setOptions(staticOptions || []);
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [query, onSearch, staticOptions, debouncedSearch, minSearchLength]);

  // Reset query after selection
  const handleChange = (newValue: MultiSelectOption[]) => {
    // Filter out duplicates by value
    const uniqueValues = newValue.filter(
      (option, index, self) => index === self.findIndex((o) => o.value === option.value)
    );

    setQuery('');
    onChange(uniqueValues);
  };

  const removeOption = (optionToRemove: MultiSelectOption) => {
    onChange(value.filter((option) => option.value !== optionToRemove.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query === '') {
      if (value.length === 0) return;

      if (focusedValueIndex === null) {
        // First backspace - focus the last item
        setFocusedValueIndex(value.length - 1);
      } else {
        // Second backspace - remove the focused item
        removeOption(value[focusedValueIndex]);
        setFocusedValueIndex(null);
      }
    } else {
      // Any other key press removes the focus
      setFocusedValueIndex(null);
    }
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
      <Combobox value={value} onChange={handleChange} multiple disabled={disabled}>
        <label htmlFor={id} className="relative">
          <div
            className={cn(
              'relative flex flex-wrap gap-1.5 min-h-[2.5rem] w-full border border-gray-200 rounded-lg bg-white p-1.5 text-left transition-colors',
              error && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
              !disabled &&
                'focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400',
              disabled && 'bg-gray-50 cursor-not-allowed',
              className
            )}
          >
            {value.map((option, index) => (
              <span
                key={option.value}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md',
                  focusedValueIndex === index ? 'bg-gray-200 ring-2 ring-gray-400' : 'bg-gray-100'
                )}
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => removeOption(option)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <div className="flex-1 flex min-w-[120px] items-center">
              <ComboboxInput
                id={id}
                autoComplete="off"
                className="w-full bg-transparent border-none p-1 text-sm outline-none"
                placeholder={value.length === 0 ? placeholder : ''}
                onChange={(e) => setQuery(e.target.value.trim())}
                onKeyDown={handleKeyDown}
                displayValue={() => query}
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />}
            </div>
            {!onSearch && (
              <ComboboxButton className="absolute right-2 top-1/2 -translate-y-1/2">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </ComboboxButton>
            )}
          </div>

          {query.length > 0 && (
            <ComboboxOptions className="absolute z-10 mt-1 w-full p-2 overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {(() => {
                if (query.length < minSearchLength && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Type to search...</div>;
                }

                if (isLoading && options.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">Searching...</div>;
                }

                const filteredOptions = options.filter(
                  (option) => !value.some((v) => v.value === option.value)
                );

                if (!isLoading && filteredOptions.length === 0) {
                  return <div className="px-4 py-2 text-sm text-gray-500">No options found</div>;
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {filteredOptions.map((option) => (
                      <ComboboxOption key={option.value} value={option} as={Fragment}>
                        {({ focus, selected }) => (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:bg-transparent"
                          >
                            <Badge variant={focus || selected ? 'primary' : 'default'}>
                              {option.label}
                              {selected && <Check className="ml-1.5 h-3 w-3" />}
                            </Badge>
                          </Button>
                        )}
                      </ComboboxOption>
                    ))}
                  </div>
                );
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
