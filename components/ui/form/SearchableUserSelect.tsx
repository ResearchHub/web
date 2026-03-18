import { useCallback } from 'react';
import { SearchableMultiSelect, MultiSelectOption } from './SearchableMultiSelect';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion, UserSuggestion } from '@/types/search';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { buildAuthorUrl } from '@/utils/url';
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
        <div className="flex items-center gap-1">
          <div className="font-medium text-sm">{option.label}</div>
          {option.isVerified && <VerifiedBadge size="sm" />}
        </div>
        {option.description && (
          <div className="text-xs text-gray-500 line-clamp-3">{option.description}</div>
        )}
        {option.profileUrl && (
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(option.profileUrl, '_blank', 'noopener,noreferrer');
            }}
            className="p-0 h-auto text-xs text-primary-600 underline hover:text-primary-700 hover:bg-transparent inline-flex items-center gap-0.5 mt-0.5"
            aria-label="View profile"
          >
            View profile
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
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
  searchType?: 'user' | 'author';
}

export function SearchableUserSelect({
  value,
  onChange,
  placeholder = 'Search for users...',
  error,
  helperText,
  debounceMs = 300,
  getOptionValue = defaultGetOptionValue,
  searchType = 'user',
}: Readonly<SearchableUserSelectProps>) {
  const handleAsyncSearch = useCallback(
    async (query: string) => {
      if (searchType === 'author') {
        const suggestions = await SearchService.suggestPeople(query);

        return suggestions
          .filter((author): author is AuthorSuggestion & { id: NonNullable<AuthorSuggestion['id']> } =>
            Boolean(author.id)
          )
          .map((author) => ({
            value: author.id.toString(),
            label: author.fullName || 'Unknown Author',
            avatarUrl: author.profileImage,
            description: author.headline,
            profileUrl:
              typeof author.id === 'number' || typeof author.id === 'string'
                ? buildAuthorUrl(author.id)
                : undefined,
          }));
      }

      const suggestions = await SearchService.getSuggestions(query, 'user');

      return suggestions
        .filter((s): s is UserSuggestion => s.entityType === 'user' && !!s.id)
        .map((user) => ({
          value: getOptionValue(user),
          label: user.displayName || 'Unknown User',
          avatarUrl: user.authorProfile?.profileImage,
          description: user.authorProfile?.headline,
          isVerified:
            user.isVerified ||
            user.authorProfile?.isVerified ||
            user.authorProfile?.user?.isVerified,
          profileUrl: user.authorProfile?.id ? buildAuthorUrl(user.authorProfile.id) : undefined,
        }));
    },
    [getOptionValue, searchType]
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
