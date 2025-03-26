'use client';

import { useCallback } from 'react';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { Building } from 'lucide-react';
import { cn } from '@/utils/styles';
import { SearchService } from '@/services/search.service';
import Image from 'next/image';

export interface Institution {
  id: string | number;
  name: string;
  location?: string;
  hIndex?: number;
  worksCount?: number;
  imageUrl?: string;
  imageThumbnailUrl?: string;
}

interface InstitutionAutocompleteProps {
  value: Institution | null;
  onChange: (institution: Institution | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export function InstitutionAutocomplete({
  value,
  onChange,
  error,
  label = 'Institution',
  required = false,
}: InstitutionAutocompleteProps) {
  const handleSearch = useCallback(async (query: string) => {
    try {
      const institutions = await SearchService.suggestInstitutions(query);

      return institutions.map((institution) => ({
        value: String(institution.id),
        label: institution.name,
        data: institution,
      }));
    } catch (error) {
      console.error('Error fetching institutions:', error);
      return [];
    }
  }, []);

  const handleCreateNewInstitution = useCallback(async (name: string) => {
    // Create a temporary institution with a generated ID
    const newInstitution: Institution = {
      id: `new-${Date.now()}`,
      name,
    };

    return {
      value: String(newInstitution.id),
      label: newInstitution.name,
      data: newInstitution,
    };
  }, []);

  const renderInstitutionOption = (
    option: SelectOption,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const institution = option.data as Institution;

    return (
      <li
        className={cn(
          'relative cursor-pointer select-none py-2 px-3 rounded-md list-none',
          focus ? 'bg-gray-100' : 'text-gray-900'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {institution.imageThumbnailUrl ? (
              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={institution.imageThumbnailUrl}
                  alt={institution.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                <Building className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{institution.name}</p>

            {institution.location && (
              <div className="flex items-center text-xs text-gray-500">
                <span>{institution.location}</span>
              </div>
            )}

            {(institution.hIndex || institution.worksCount) && (
              <div className="flex items-center text-xs text-gray-500 gap-2">
                {institution.hIndex && <span>H-Index: {institution.hIndex}</span>}
                {institution.worksCount && <span>{institution.worksCount} Works</span>}
              </div>
            )}
          </div>
        </div>
      </li>
    );
  };

  const renderSelectedInstitution = (option: SelectOption<Institution>) => {
    const institution = option.data as Institution;

    return (
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {institution.imageThumbnailUrl ? (
            <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={institution.imageThumbnailUrl}
                alt={institution.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center">
              <Building className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{institution.name}</p>
        </div>
      </div>
    );
  };

  return (
    <AutocompleteSelect<Institution>
      label={label}
      required={required}
      value={
        value
          ? {
              value: String(value.id),
              label: value.name,
              data: value,
            }
          : null
      }
      onChange={(newValue) => {
        onChange(newValue?.data || null);
      }}
      onSearch={handleSearch}
      placeholder="Search for an institution..."
      debounceMs={300}
      error={error}
      renderOption={renderInstitutionOption}
      renderSelectedValue={renderSelectedInstitution}
      allowCreatingNew={true}
      onCreateNew={handleCreateNewInstitution}
      createNewLabel="Add new institution"
    />
  );
}
