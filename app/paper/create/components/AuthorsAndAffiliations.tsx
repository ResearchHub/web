'use client';

import React, { useState, useCallback } from 'react';
import { Users, ChevronUp, ChevronDown, Trash2, Mail, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { AuthorSearch, Author } from '@/components/Search/AuthorSearch';

// Updated state type
export interface SelectedAuthor {
  author: Author;
  isCorrespondingAuthor: boolean;
}

interface AuthorsAndAffiliationsProps {
  authors: SelectedAuthor[];
  onChange: (authors: SelectedAuthor[]) => void;
}

// Function to get ordinal suffix
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export function AuthorsAndAffiliations({ authors, onChange }: AuthorsAndAffiliationsProps) {
  const [authorError, setAuthorError] = useState<string | null>(null);

  const validateAuthors = useCallback((currentAuthors: SelectedAuthor[]) => {
    if (currentAuthors.length === 0) {
      setAuthorError('Please add at least one author.');
      return false;
    }
    if (!currentAuthors.some((a) => a.isCorrespondingAuthor)) {
      setAuthorError('Please designate one author as the corresponding author.');
      return false;
    }
    setAuthorError(null);
    return true;
  }, []);

  // Simplify handler: receives Author type directly
  const handleAuthorSelect = (authorToAdd: Author) => {
    // Prevent adding duplicates
    if (!authors.some((a) => a.author.id === authorToAdd.id)) {
      const newAuthorEntry: SelectedAuthor = {
        author: authorToAdd,
        isCorrespondingAuthor: authors.length === 0, // Default first author as corresponding
      };
      const newAuthors = [...authors, newAuthorEntry];
      onChange(newAuthors);
      validateAuthors(newAuthors);
    } else {
      // Optionally provide feedback that the author is already added
      console.log('Author already added');
    }
  };

  const handleRemoveAuthor = (index: number) => {
    const removedAuthor = authors[index];
    const newAuthors = authors.filter((_, i) => i !== index);

    if (removedAuthor.isCorrespondingAuthor && newAuthors.length > 0) {
      if (!newAuthors.some((a) => a.isCorrespondingAuthor)) {
        newAuthors[0].isCorrespondingAuthor = true;
      }
    }

    onChange(newAuthors);
    validateAuthors(newAuthors);
  };

  const moveAuthor = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= authors.length) return;

    const newAuthors = [...authors];
    const [movedAuthor] = newAuthors.splice(fromIndex, 1);
    newAuthors.splice(toIndex, 0, movedAuthor);

    onChange(newAuthors);
  };

  const handleSetCorresponding = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const isCorresponding = event.target.checked;
    const newAuthors = authors.map((author, i) => ({
      ...author,
      isCorrespondingAuthor:
        i === index ? isCorresponding : isCorresponding ? false : author.isCorrespondingAuthor,
    }));

    if (!newAuthors.some((a) => a.isCorrespondingAuthor) && newAuthors.length > 0) {
      if (
        !isCorresponding &&
        authors[index].isCorrespondingAuthor &&
        authors.filter((a) => a.isCorrespondingAuthor).length === 1
      ) {
        // Prevent unchecking the last corresponding author
        // Optionally show a toast/alert here
        setAuthorError('At least one author must be corresponding.');
        return;
      }
    }

    if (newAuthors.some((a) => a.isCorrespondingAuthor)) {
      setAuthorError(null);
    }

    onChange(newAuthors);
    validateAuthors(newAuthors);
  };

  return (
    <div className="space-y-4">
      {/* Title and description removed - provided by parent component */}

      {/* Author search remains */}
      <AuthorSearch onAuthorSelect={handleAuthorSelect} className="w-full" label="Search authors" />

      {/* Validation Error Display */}
      {authorError && (
        <Alert variant="error" className="mt-2">
          {authorError}
        </Alert>
      )}

      {/* Author List */}
      {authors.length === 0 ? (
        // Restore the empty state display
        <div className="bg-gray-50 p-6 rounded-lg text-center mt-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-6 w-6 text-gray-500" />
          </div>
          <p className="mt-3 text-sm text-gray-600">Search above to add authors to your paper.</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          <Alert variant="info" className="mb-4">
            Authors will appear in the order shown. Ensure one author is marked as corresponding.
          </Alert>
          {/* Removed divide-y, added space-y-2 */}
          <div className="space-y-6">
            {' '}
            {/* Removed border, padding, and rounded-lg from container */}
            {authors.map((authorEntry, index) => {
              const position = index + 1;
              const isLast = index === authors.length - 1;
              const badgeText =
                isLast && authors.length > 1
                  ? 'Last Author'
                  : `${position}${getOrdinalSuffix(position)} Author`;

              return (
                <div
                  key={authorEntry.author.id || index}
                  className="relative p-4 flex items-center justify-between hover:bg-gray-50 rounded-md border border-gray-200"
                >
                  {/* Individual Author Position Badge */}
                  <Badge
                    variant="default"
                    className="absolute top-0 left-0 -translate-y-1/2 translate-x-2 z-1 px-1.5 py-0.5 text-[10px] font-medium"
                  >
                    {badgeText}
                  </Badge>
                  <div className="flex items-center gap-3 flex-grow">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={authorEntry.author.profileImage}
                        alt={authorEntry.author.fullName || 'Author'}
                        size="md"
                      />
                    </div>

                    <div className="flex-grow">
                      <h5 className="text-sm font-medium">{authorEntry.author.fullName}</h5>
                      <div className="mt-1">
                        <Checkbox
                          id={`corresponding-${authorEntry.author.id}-${index}`}
                          label="Corresponding Author"
                          checked={authorEntry.isCorrespondingAuthor}
                          onChange={(e) => handleSetCorresponding(index, e)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Combined and restyled action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    {/* Move Up Button */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAuthor(index, index - 1);
                      }}
                      disabled={index === 0}
                      variant="ghost"
                      size="icon"
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      aria-label="Move author up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    {/* Move Down Button */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveAuthor(index, index + 1);
                      }}
                      disabled={index === authors.length - 1}
                      variant="ghost"
                      size="icon"
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      aria-label="Move author down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {/* Delete Button */}
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAuthor(index);
                      }}
                      variant="ghost"
                      size="icon"
                      className="p-2 text-gray-400 hover:text-red-600"
                      aria-label="Delete author"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
