'use client';

import React, { useState } from 'react';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion } from '@/types/search';
import { Users, Check, Calendar, GraduationCap, Award } from 'lucide-react';
import { cn } from '@/utils/styles';
import { Avatar } from '../ui/Avatar';
import { formatTimestamp } from '@/utils/date';

// Local Author type
export interface Author {
  id: string | number;
  fullName: string;
  profileImage?: string;
  // Add other relevant fields that ARE available on AuthorSuggestion
  headline?: string;
  createdDate?: string;
  education?: string[];
  institutions?: { name: string }[]; // Assuming AuthorSuggestion has institutions with name
  reputationHubs?: string[];
}

interface AuthorSearchProps {
  onAuthorSelect: (author: Author) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function AuthorSearch({
  onAuthorSelect,
  label = 'Author',
  placeholder = 'Search or create an author...',
  required = false,
  error,
  className,
}: AuthorSearchProps) {
  const [selectedAuthorValue, setSelectedAuthorValue] =
    useState<SelectOption<AuthorSuggestion> | null>(null);

  const handleSearchAuthor = async (query: string): Promise<SelectOption<AuthorSuggestion>[]> => {
    if (!query.trim()) return [];
    // Assuming suggestPeople returns AuthorSuggestion[]
    const results: AuthorSuggestion[] = await SearchService.suggestPeople(query);
    return results.map((author) => ({
      value: author.id?.toString() || author.fullName || Date.now().toString(), // Robust value generation
      label: author.fullName || 'Unnamed Author',
      data: author,
    }));
  };

  const handleCreateNewAuthor = async (name: string): Promise<SelectOption<AuthorSuggestion>> => {
    // Create a temporary author structure based *only* on known AuthorSuggestion fields
    const newAuthorData: AuthorSuggestion = {
      id: `new-${Date.now()}`,
      fullName: name,
      profileImage: undefined,
      headline: undefined,
      createdDate: undefined,
      education: [],
      institutions: [],
      reputationHubs: [],
    };

    return {
      value: newAuthorData.id?.toString() || '',
      label: newAuthorData.fullName || '',
      data: newAuthorData,
    };
  };

  const handleChange = (selectedOption: SelectOption<AuthorSuggestion> | null) => {
    // Don't update the visual state here if we want the input cleared
    // setSelectedAuthorValue(selectedOption);
    if (selectedOption?.data) {
      const suggestionData = selectedOption.data;
      // Map only existing fields from AuthorSuggestion to Author
      const author: Author = {
        id: suggestionData.id ?? `temp-${Date.now()}`,
        fullName: suggestionData.fullName || 'Unnamed Author',
        profileImage: suggestionData.profileImage,
        // Removed firstName, lastName mapping
        headline: suggestionData.headline,
        createdDate: suggestionData.createdDate,
        education: suggestionData.education,
        // Ensure institutions is mapped correctly if structure differs
        institutions: suggestionData.institutions?.map((inst) => ({ name: inst.name })),
        reputationHubs: suggestionData.reputationHubs,
      };
      onAuthorSelect(author);
      // Manually clear the *controlled* value after selection processed
      setSelectedAuthorValue(null);
    } else {
      // Handle clear event if necessary (e.g., user backspaces)
      setSelectedAuthorValue(null);
    }
  };

  // --- Rendering logic with null checks ---

  const renderAuthorOption = (
    option: SelectOption<AuthorSuggestion>,
    { focus, selected }: { selected: boolean; focus: boolean }
  ): React.ReactElement => {
    const authorData = option.data;
    if (!authorData) return <></>;

    // Format the created date in a user-friendly way
    const formatMemberSince = (dateString: string) => {
      try {
        // If it's a recent date (within 24 hours), show relative time
        // Otherwise show a formatted date
        return formatTimestamp(dateString);
      } catch (error) {
        // Fallback to original format if parsing fails
        return dateString;
      }
    };

    return (
      <li
        className={cn(
          'relative cursor-pointer select-none py-3 px-3 rounded-md list-none',
          focus ? 'bg-gray-100' : 'text-gray-900'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={authorData.profileImage}
              alt={authorData.fullName || 'Unknown Author'}
              size={48}
            />
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium truncate', focus && 'font-semibold')}>
              {authorData.fullName}
            </p>

            {authorData.headline && (
              <p className="text-xs text-gray-600 truncate mb-1">{authorData.headline}</p>
            )}

            {/* User Since */}
            {authorData.createdDate && (
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                <span>Member since {formatMemberSince(authorData.createdDate)}</span>
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
        </div>
      </li>
    );
  };

  const renderSelectedAuthor = (option: SelectOption<AuthorSuggestion>): React.ReactElement => {
    const authorData = option.data;
    if (!authorData) return <></>;

    return (
      <div className="flex items-center gap-2">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={authorData.profileImage}
            alt={authorData.fullName || 'Unknown Author'}
            size={32}
          />
        </div>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{authorData.fullName}</p>
        </div>
      </div>
    );
  };

  // --- End of rendering logic ---

  return (
    <div className={className}>
      <AutocompleteSelect<AuthorSuggestion>
        label={label}
        required={required}
        value={selectedAuthorValue}
        onChange={handleChange}
        onSearch={handleSearchAuthor}
        placeholder={placeholder}
        debounceMs={300}
        error={error}
        renderOption={renderAuthorOption}
        renderSelectedValue={renderSelectedAuthor}
        allowCreatingNew={true}
        onCreateNew={handleCreateNewAuthor}
        createNewLabel="Create new author: "
      />
    </div>
  );
}
