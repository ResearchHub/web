import { useCallback, useEffect, useRef, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import { cn } from '@/utils/styles';
import { SearchService } from '@/services/search.service';
import { UserSuggestion } from '@/types/search';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

export interface UserOption {
  value: string;
  label: string;
  avatarUrl?: string;
  headline?: string;
  isVerified?: boolean;
}

interface SearchableUserSingleSelectProps {
  value: UserOption | null;
  onChange: (value: UserOption | null) => void;
  placeholder?: string;
  debounceMs?: number;
  getOptionValue?: (user: UserSuggestion) => string;
  className?: string;
}

const defaultGetOptionValue = (user: UserSuggestion): string => user.id!.toString();

export function SearchableUserSingleSelect({
  value,
  onChange,
  placeholder = 'Search users...',
  debounceMs = 300,
  getOptionValue = defaultGetOptionValue,
  className,
}: Readonly<SearchableUserSingleSelectProps>) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [options, setOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useCallback(
    debounce(async (q: string) => {
      if (q.length < 2) {
        setOptions([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const suggestions = await SearchService.getSuggestions(q, 'user');
        const results = suggestions
          .filter((s): s is UserSuggestion => s.entityType === 'user' && !!s.id)
          .map((user) => ({
            value: getOptionValue(user),
            label: user.displayName || 'Unknown User',
            avatarUrl: user.authorProfile?.profileImage,
            headline: user.authorProfile?.headline,
            isVerified:
              user.isVerified ||
              user.authorProfile?.isVerified ||
              user.authorProfile?.user?.isVerified,
          }));
        setOptions(results);
      } catch {
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [getOptionValue, debounceMs]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setOptions([]);
    }
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleChange = (selected: UserOption | null) => {
    onChange(selected);
    setQuery('');
    if (selected) {
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    setQuery('');
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setQuery('');
    }, 150);
  };

  const showSelectedState = value && !isFocused;

  return (
    <Combobox value={value} onChange={handleChange} by="value">
      <div className={cn('relative', className)}>
        <div className="flex items-center w-full h-9 px-3 bg-gray-100/75 hover:bg-gray-200/75 rounded-full transition-colors border border-transparent focus-within:border-gray-300 focus-within:bg-white">
          {showSelectedState ? (
            <Avatar
              src={value.avatarUrl}
              alt={value.label}
              size="xs"
              disableTooltip
              className="mr-2 flex-shrink-0"
            />
          ) : (
            <SearchIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
          )}
          <ComboboxInput
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 outline-none min-w-0"
            placeholder={showSelectedState ? value.label : placeholder}
            value={isFocused ? query : (value?.label ?? '')}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin ml-1 flex-shrink-0" />
          )}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 p-0.5 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
        </div>

        <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          {options.length === 0 && query.length >= 2 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">No users found</div>
          ) : (
            options.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option}
                className="cursor-pointer select-none data-[focus]:bg-gray-50"
              >
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar
                    src={option.avatarUrl}
                    alt={option.label}
                    size="sm"
                    disableTooltip
                    className="flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {option.label}
                      </span>
                      {option.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    {option.headline && (
                      <div className="text-xs text-gray-500 truncate">{option.headline}</div>
                    )}
                  </div>
                </div>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
