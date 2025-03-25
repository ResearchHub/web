'use client';

import { Users, Check, Calendar, GraduationCap, Award, Plus, X } from 'lucide-react';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { useCallback, useState } from 'react';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion } from '@/types/search';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';

export interface AuthorWithAffiliation {
  author: AuthorSuggestion;
  isCorrespondingAuthor: boolean;
}

interface MultipleAuthorsSectionProps {
  authors: AuthorWithAffiliation[];
  onChange: (authors: AuthorWithAffiliation[]) => void;
  error?: string | null;
}

export function MultipleAuthorsSection({ authors, onChange, error }: MultipleAuthorsSectionProps) {
  const [currentAuthor, setCurrentAuthor] = useState<AuthorSuggestion | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    const results = await SearchService.suggestPeople(query);
    return results.map((author) => ({
      value: author.id?.toString() || '',
      label: author.fullName || '',
      data: author,
    }));
  }, []);

  const handleCreateNewAuthor = useCallback(async (name: string) => {
    console.log(`Creating new author: ${name}`);

    // Mock a 1-second delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a mock author object
    const newAuthor: AuthorSuggestion = {
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

  const handleAddAuthor = () => {
    if (currentAuthor) {
      // Check if author already exists
      const authorExists = authors.some((a) => a.author.id === currentAuthor.id);

      if (!authorExists) {
        onChange([
          ...authors,
          {
            author: currentAuthor,
            isCorrespondingAuthor: authors.length === 0, // First author is corresponding by default
          },
        ]);
        setCurrentAuthor(null);
      }
    }
  };

  const handleRemoveAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);

    // If we removed the corresponding author, set the first author as corresponding
    if (authors[index].isCorrespondingAuthor && newAuthors.length > 0) {
      newAuthors[0].isCorrespondingAuthor = true;
    }

    onChange(newAuthors);
  };

  const toggleCorrespondingAuthor = (index: number) => {
    const newAuthors = authors.map((author, i) => ({
      ...author,
      isCorrespondingAuthor: i === index,
    }));

    onChange(newAuthors);
  };

  const renderAuthorOption = (
    option: SelectOption,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const authorData = option.data as AuthorSuggestion;
    const isSelected = currentAuthor?.id === authorData.id;

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

  const renderSelectedAuthor = (option: SelectOption<AuthorSuggestion>) => {
    const authorData = option.data as AuthorSuggestion;

    return (
      <div className="flex items-center gap-2">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {authorData.profileImage ? (
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img
                src={authorData.profileImage}
                alt={authorData.fullName || ''}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{authorData.fullName}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Authors</h3>

      {/* Author input field with add button */}
      <div className="flex gap-2">
        <div className="flex-1">
          <AutocompleteSelect<AuthorSuggestion>
            value={
              currentAuthor
                ? {
                    value: currentAuthor.id?.toString() || '',
                    label: currentAuthor.fullName || '',
                    data: currentAuthor,
                  }
                : null
            }
            onChange={(newAuthor) => {
              setCurrentAuthor(newAuthor?.data || null);
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
        <Button onClick={handleAddAuthor} disabled={!currentAuthor} className="flex-shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Author list */}
      {authors.length > 0 && (
        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Author List</h4>
            <div className="space-y-3">
              {authors.map((authorItem, index) => (
                <div
                  key={authorItem.author.id}
                  className="flex items-center justify-between bg-white p-3 rounded border"
                >
                  <div className="flex items-center gap-3">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                      {authorItem.author.profileImage ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img
                            src={authorItem.author.profileImage}
                            alt={authorItem.author.fullName || ''}
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
                    <div>
                      <p className="font-medium">{authorItem.author.fullName}</p>
                      {authorItem.author.institutions?.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {authorItem.author.institutions[0].name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`corresponding-${authorItem.author.id}`}
                      label="Corresponding author"
                      checked={authorItem.isCorrespondingAuthor}
                      onChange={() => toggleCorrespondingAuthor(index)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAuthor(index)}
                      aria-label="Remove author"
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
