import { useFormContext } from 'react-hook-form';
import { Users, Check } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { SearchableSelect, SelectOption } from '@/components/ui/form/SearchableSelect';
import { useCallback, useState } from 'react';
import { SearchService } from '@/services/search.service';
import { getFieldErrorMessage } from '@/utils/form';
import { SuggestedAuthor } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import Image from 'next/image';

export function AuthorsSection() {
  // const {
  //   watch,
  //   setValue,
  //   formState: { errors },
  // } = useFormContext();

  // const author = watch('author') || null;

  const [author, setAuthor] = useState<SuggestedAuthor | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    const results = await SearchService.suggestPeople(query);
    return results.map((author) => ({
      value: author.id?.toString() || '',
      label: author.fullName || '',
      data: author, // This will now be typed as SuggestedAuthor
    }));
  }, []);

  const renderAuthorOption = (
    option: SelectOption,
    { selected, focus }: { selected: boolean; focus: boolean }
  ) => {
    const authorData = option.data as SuggestedAuthor;

    return (
      <li
        className={cn(
          'relative cursor-pointer select-none py-3 px-3 rounded-md',
          focus ? 'bg-gray-100' : 'text-gray-900'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {authorData.profileImage ? (
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src={authorData.profileImage}
                  alt={authorData.fullName || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium truncate', selected && 'font-semibold')}>
              {authorData.fullName}
            </p>

            {authorData.headline && (
              <p className="text-xs text-gray-500 truncate">{authorData.headline}</p>
            )}

            {authorData.institutions && authorData.institutions.length > 0 && (
              <p className="text-xs text-gray-500 truncate">
                {authorData.institutions.map((inst) => inst.name).join(', ')}
              </p>
            )}
          </div>

          {/* Selected checkmark */}
          {selected && (
            <div className="flex-shrink-0">
              <Check className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>
      <SearchableSelect<SuggestedAuthor>
        value={
          author
            ? { value: author.id?.toString() || '', label: author.fullName || '', data: author }
            : null
        }
        onChange={(newAuthor) => {
          setAuthor(newAuthor?.data || null);
        }}
        onSearch={handleSearch}
        placeholder="Search for an author..."
        debounceMs={500}
        renderOption={renderAuthorOption}
      />
    </div>
  );
}
