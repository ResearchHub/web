import { Users, Check, Calendar, GraduationCap, Award } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { useCallback, useState } from 'react';
import { SearchService } from '@/services/search.service';
import { SuggestedAuthor } from '@/types/authorProfile';
import { cn } from '@/utils/styles';

export function AuthorsSection() {
  const [author, setAuthor] = useState<SuggestedAuthor | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    const results = await SearchService.suggestPeople(query);
    return results.map((author) => ({
      value: author.id?.toString() || '',
      label: author.fullName || '',
      data: author, // This will now be typed as SuggestedAuthor
    }));
  }, []);

  // Mock function to create a new author
  const handleCreateNewAuthor = useCallback(async (name: string) => {
    console.log(`Creating new author: ${name}`);

    // Mock a 1-second delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a mock author object
    const newAuthor: SuggestedAuthor = {
      id: `new-${Date.now()}`, // Generate a temporary ID
      fullName: name,
      headline: 'New Author',
      institutions: [{ id: 'new-institution', name: 'Add institution details' }],
      reputationHubs: [],
      education: [],
      createdDate: new Date().toLocaleDateString(),
    };

    // Return the new author as a SelectOption
    return {
      value: newAuthor.id?.toString() || '',
      label: newAuthor.fullName || '',
      data: newAuthor,
    };
  }, []);

  const renderAuthorOption = (
    option: SelectOption,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const authorData = option.data as SuggestedAuthor;
    const isSelected = author?.id === authorData.id;

    return (
      <li
        className={cn(
          'relative cursor-pointer select-none py-3 px-3 rounded-md list-none',
          focus ? 'bg-gray-100' : 'text-gray-900',
          isSelected && 'bg-blue-50'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {authorData.profileImage ? (
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={authorData.profileImage}
                  alt={authorData.fullName || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-500" />
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium truncate', isSelected && 'font-semibold')}>
              {authorData.fullName}
            </p>

            {authorData.headline && (
              <p className="text-xs text-gray-600 truncate mb-1">{authorData.headline}</p>
            )}

            {/* User Since */}
            {authorData.createdDate && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Member since {authorData.createdDate}</span>
              </div>
            )}

            {/* Education & Institutions */}
            {(authorData.education?.length > 0 || authorData.institutions?.length > 0) && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <GraduationCap className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {[
                    ...(authorData.education || []),
                    ...(authorData.institutions?.map((inst) => inst.name) || []),
                  ].join(', ')}
                </span>
              </div>
            )}

            {/* Reputation Hubs */}
            {authorData.reputationHubs?.length > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <Award className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{authorData.reputationHubs.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Selected checkmark */}
          {isSelected && (
            <div className="flex-shrink-0">
              <Check className="h-4 w-4 text-blue-500" />
            </div>
          )}
        </div>
      </li>
    );
  };

  const renderSelectedAuthor = (option: SelectOption<SuggestedAuthor>) => {
    const authorData = option.data as SuggestedAuthor;

    return (
      <div className="flex items-center gap-2">
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
          <p className="text-base font-semibold truncate">{authorData.fullName}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>
      <AutocompleteSelect<SuggestedAuthor>
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
        renderSelectedValue={renderSelectedAuthor}
        allowCreatingNew={true}
        onCreateNew={handleCreateNewAuthor}
        createNewLabel="Create new author"
      />
    </div>
  );
}
