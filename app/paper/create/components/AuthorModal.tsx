'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/form/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form/Input';
import { Checkbox } from '@/components/ui/form/Checkbox';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion } from '@/types/search';
import { Users, Check, Calendar, GraduationCap, Award } from 'lucide-react';
import { InstitutionAutocomplete, Institution } from './InstitutionAutocomplete';
import { cn } from '@/utils/styles';

export interface AuthorWithAffiliation {
  author: AuthorSuggestion;
  institution: Institution | null;
  department: string;
  email: string;
  isCorrespondingAuthor: boolean;
}

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (author: AuthorWithAffiliation) => void;
  editingAuthor?: AuthorWithAffiliation;
}

export function AuthorModal({ isOpen, onClose, onSave, editingAuthor }: AuthorModalProps) {
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorSuggestion | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [isCorrespondingAuthor, setIsCorrespondingAuthor] = useState(false);

  // Form validation
  const [errors, setErrors] = useState<{
    author?: string;
    institution?: string;
    department?: string;
  }>({});

  // Initialize form with editing data if available
  useEffect(() => {
    if (editingAuthor) {
      setSelectedAuthor(editingAuthor.author);
      setSelectedInstitution(editingAuthor.institution);
      setDepartment(editingAuthor.department);
      setEmail(editingAuthor.email);
      setIsCorrespondingAuthor(editingAuthor.isCorrespondingAuthor);
    } else {
      resetForm();
    }
  }, [editingAuthor, isOpen]);

  const resetForm = () => {
    setSelectedAuthor(null);
    setSelectedInstitution(null);
    setDepartment('');
    setEmail('');
    setIsCorrespondingAuthor(false);
    setErrors({});
  };

  const handleSearchAuthor = async (query: string) => {
    const results = await SearchService.suggestPeople(query);
    return results.map((author) => ({
      value: author.id?.toString() || '',
      label: author.fullName || '',
      data: author,
    }));
  };

  const handleCreateNewAuthor = async (name: string) => {
    // Create a temporary author with a generated ID
    const newAuthor: AuthorSuggestion = {
      id: `new-${Date.now()}`,
      fullName: name,
      headline: '',
      institutions: [],
      reputationHubs: [],
      education: [],
    };

    return {
      value: newAuthor.id?.toString() || '',
      label: newAuthor.fullName || '',
      data: newAuthor,
    };
  };

  const validateForm = (): boolean => {
    const newErrors: {
      author?: string;
      institution?: string;
      department?: string;
    } = {};

    if (!selectedAuthor) {
      newErrors.author = 'Author is required';
    }

    if (!selectedInstitution) {
      newErrors.institution = 'Institution is required';
    }

    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave({
      author: selectedAuthor!,
      institution: selectedInstitution,
      department,
      email, // Keep email in the data model, but don't show the field
      isCorrespondingAuthor,
    });

    onClose();
  };

  const renderAuthorOption = (
    option: SelectOption,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const authorData = option.data as AuthorSuggestion;
    const isSelected = selectedAuthor?.id === authorData.id;

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
    <Modal isOpen={isOpen} onClose={onClose} title={editingAuthor ? 'Edit Author' : 'Add Author'}>
      <div className="space-y-4">
        <div>
          <AutocompleteSelect<AuthorSuggestion>
            label="Author"
            required
            value={
              selectedAuthor
                ? {
                    value: selectedAuthor.id?.toString() || '',
                    label: selectedAuthor.fullName || '',
                    data: selectedAuthor,
                  }
                : null
            }
            onChange={(newAuthor) => {
              setSelectedAuthor(newAuthor?.data || null);
              if (errors.author) {
                setErrors({ ...errors, author: undefined });
              }
            }}
            onSearch={handleSearchAuthor}
            placeholder="Search for an author..."
            debounceMs={300}
            error={errors.author}
            renderOption={renderAuthorOption}
            renderSelectedValue={renderSelectedAuthor}
            allowCreatingNew={true}
            onCreateNew={handleCreateNewAuthor}
            createNewLabel="Create new author"
          />
        </div>

        <div>
          <InstitutionAutocomplete
            value={selectedInstitution}
            onChange={(institution) => {
              setSelectedInstitution(institution);
              if (errors.institution) {
                setErrors({ ...errors, institution: undefined });
              }
            }}
            error={errors.institution}
            required
          />
        </div>

        <div>
          <Input
            label="Department"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              if (errors.department) {
                setErrors({ ...errors, department: undefined });
              }
            }}
            placeholder="Department of the institution"
            error={errors.department}
            required
          />
        </div>

        <div className="pt-2">
          <Checkbox
            id="corresponding-author"
            checked={isCorrespondingAuthor}
            onCheckedChange={(checked: boolean) => setIsCorrespondingAuthor(checked)}
            label="Corresponding author"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
}
