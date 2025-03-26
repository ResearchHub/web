'use client';

import { useState } from 'react';
import { Users, ChevronUp, ChevronDown, Trash2, Mail, Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AuthorModal, AuthorWithAffiliation } from './AuthorModal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';

export type { AuthorWithAffiliation };

interface AuthorsAndAffiliationsProps {
  authors: AuthorWithAffiliation[];
  onChange: (authors: AuthorWithAffiliation[]) => void;
  error?: string | null;
}

export function AuthorsAndAffiliations({ authors, onChange, error }: AuthorsAndAffiliationsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthorIndex, setEditingAuthorIndex] = useState<number | null>(null);

  const handleAddAuthor = () => {
    setEditingAuthorIndex(null);
    setIsModalOpen(true);
  };

  const handleEditAuthor = (index: number) => {
    setEditingAuthorIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveAuthor = (author: AuthorWithAffiliation) => {
    if (editingAuthorIndex !== null) {
      // Update existing author
      const newAuthors = [...authors];
      newAuthors[editingAuthorIndex] = author;

      // If this is the only corresponding author, keep it that way
      if (author.isCorrespondingAuthor) {
        for (let i = 0; i < newAuthors.length; i++) {
          if (i !== editingAuthorIndex) {
            newAuthors[i].isCorrespondingAuthor = false;
          }
        }
      }

      onChange(newAuthors);
    } else {
      // Add new author
      const newAuthors = [...authors, author];

      // If this is the first author or marked as corresponding, update other authors
      if (author.isCorrespondingAuthor || newAuthors.length === 1) {
        for (let i = 0; i < newAuthors.length - 1; i++) {
          newAuthors[i].isCorrespondingAuthor = false;
        }
      }

      onChange(newAuthors);
    }
  };

  const handleRemoveAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);

    // If we removed the corresponding author and there are still authors, set the first one as corresponding
    if (authors[index].isCorrespondingAuthor && newAuthors.length > 0) {
      newAuthors[0].isCorrespondingAuthor = true;
    }

    onChange(newAuthors);
  };

  const moveAuthor = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= authors.length) return;

    const newAuthors = [...authors];
    const [movedAuthor] = newAuthors.splice(fromIndex, 1);
    newAuthors.splice(toIndex, 0, movedAuthor);

    onChange(newAuthors);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Authors & Affiliations</h3>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {authors.length > 0 && (
        <Alert variant="info" className="mb-4">
          Authors will be displayed in the order shown below. The first author is typically the main
          contributor. At least one author must be designated as the corresponding author.
        </Alert>
      )}

      {authors.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-6 w-6 text-gray-500" />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            No authors added yet. Click the button below to add authors and their affiliations.
          </p>
          <div className="mt-4">
            <Button
              onClick={handleAddAuthor}
              className="flex items-center gap-2 mx-auto"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              <span>Add author</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {authors.map((author, index) => (
              <div
                key={`${author.author.id}-${index}`}
                className="p-4 flex items-start justify-between"
                onClick={() => handleEditAuthor(index)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Avatar
                      src={author.author.profileImage}
                      alt={author.author.fullName || 'Author'}
                      size="md"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium">{author.author.fullName}</h5>
                      {author.isCorrespondingAuthor && (
                        <Badge variant="primary" className="text-xs">
                          <Mail className="h-3 w-3 mr-1" />
                          Corresponding author
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Building className="h-3 w-3 flex-shrink-0" />
                      <span>{author.institution?.name}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Department: {author.department || 'Not specified'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-gray-800 mb-1">{index + 1}</span>
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveAuthor(index, index - 1);
                        }}
                        disabled={index === 0}
                        variant="ghost"
                        size="icon"
                        className="p-1 h-auto w-auto text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveAuthor(index, index + 1);
                        }}
                        disabled={index === authors.length - 1}
                        variant="ghost"
                        size="icon"
                        className="p-1 h-auto w-auto text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAuthor(index);
                    }}
                    variant="ghost"
                    size="icon"
                    className="p-2 h-auto w-auto text-gray-400 hover:text-red-600"
                    aria-label="Delete author"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleAddAuthor}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Plus className="h-4 w-4" />
              <span>Add author</span>
            </Button>
          </div>
        </div>
      )}

      <AuthorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAuthor}
        editingAuthor={editingAuthorIndex !== null ? authors[editingAuthorIndex] : undefined}
      />
    </div>
  );
}
