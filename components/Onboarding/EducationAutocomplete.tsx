'use client';

import { useCallback } from 'react';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { School } from 'lucide-react';
import { cn } from '@/utils/styles';
import { UserService } from '@/services/user.service';

export interface University {
  id: number | string;
  name: string;
  country?: string;
  state?: string;
  city?: string;
}

interface EducationAutocompleteProps {
  value: University | null;
  onChange: (university: University | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function EducationAutocomplete({
  value,
  onChange,
  error,
  label = 'School',
  required = false,
  placeholder = 'Search for a university...',
}: EducationAutocompleteProps) {
  const handleSearch = useCallback(async (query: string) => {
    try {
      const universities = await UserService.searchUniversities(query);

      return universities.map((university) => ({
        value: String(university.id),
        label: university.name,
        data: university,
      }));
    } catch (error) {
      console.error('Error fetching universities:', error);
      return [];
    }
  }, []);

  const renderUniversityOption = (
    option: SelectOption,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const university = option.data as University;

    return (
      <li
        className={cn(
          'relative cursor-pointer select-none py-2 px-3 rounded-md list-none',
          focus ? 'bg-gray-100' : 'text-gray-900'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center">
              <School className="h-4 w-4 text-indigo-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{university.name}</p>

            {(university.city || university.state || university.country) && (
              <div className="flex items-center text-xs text-gray-500">
                <span>
                  {[university.city, university.state, university.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </li>
    );
  };

  const renderSelectedUniversity = (option: SelectOption<University>) => {
    const university = option.data as University;

    return (
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <div className="h-6 w-6 rounded-md bg-indigo-50 flex items-center justify-center">
            <School className="h-3 w-3 text-indigo-500" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{university.name}</p>
        </div>
      </div>
    );
  };

  return (
    <AutocompleteSelect<University>
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
      placeholder={placeholder}
      debounceMs={300}
      error={error}
      renderOption={renderUniversityOption}
      renderSelectedValue={renderSelectedUniversity}
      allowCreatingNew={false}
    />
  );
}
