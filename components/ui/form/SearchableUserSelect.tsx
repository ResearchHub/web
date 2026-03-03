import { useCallback } from 'react';
import { SearchableMultiSelect, MultiSelectOption } from './SearchableMultiSelect';
import { SearchService } from '@/services/search.service';
import { UserSuggestion } from '@/types/search';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';

const defaultGetOptionValue = (user: UserSuggestion): string =>
  user.authorProfile?.id?.toString() || user.id!.toString();

const renderUserOption = (
  option: MultiSelectOption,
  { focus }: { focus: boolean; selected: boolean }
) => (
  <div className={cn('px-4 py-2', focus && 'bg-gray-100')}>
    <div className="flex items-start gap-3">
      <Avatar
        src={option.avatarUrl}
        alt={option.label}
        size="sm"
        disableTooltip
        className="mt-0.5 flex-shrink-0"
      />
      <div className="min-w-0">
        <div className="font-medium text-sm">{option.label}</div>
        {option.description && <div className="text-xs text-gray-500">{option.description}</div>}
      </div>
    </div>
  </div>
);

export interface SearchableUserSelectProps {
  value: MultiSelectOption[];
  onChange: (value: MultiSelectOption[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  debounceMs?: number;
  getOptionValue?: (user: UserSuggestion) => string;
}

export function SearchableUserSelect({
  value,
  onChange,
  placeholder = 'Search for users...',
  error,
  helperText,
  debounceMs = 300,
  getOptionValue = defaultGetOptionValue,
}: Readonly<SearchableUserSelectProps>) {
  const handleAsyncSearch = useCallback(
    async (query: string) => {
      const suggestions = await SearchService.getSuggestions(query, 'user');

      return suggestions
        .filter((s): s is UserSuggestion => s.entityType === 'user' && !!s.id)
        .map((user) => ({
          value: getOptionValue(user),
          label: user.displayName || 'Unknown User',
          avatarUrl: user.authorProfile?.profileImage,
          description: user.authorProfile?.headline,
        }));
    },
    [getOptionValue]
  );

  return (
    <SearchableMultiSelect
      value={value}
      onChange={onChange}
      onAsyncSearch={handleAsyncSearch}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      debounceMs={debounceMs}
      renderOption={renderUserOption}
    />
  );
}
