import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import {
  SearchableMultiSelect,
  MultiSelectOption,
} from '@/components/ui/form/SearchableMultiSelect';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { getFieldErrorMessage } from '@/utils/form';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion } from '@/types/search';

export function ContactsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const contacts = watch('contacts') || [];

  // Helper function for async people search
  const handleAsyncSearch = useCallback(async (query: string): Promise<MultiSelectOption[]> => {
    try {
      const authorSuggestions: AuthorSuggestion[] = await SearchService.suggestPeople(query);

      // Filter out suggestions without userId and map to options
      return authorSuggestions
        .filter((author) => author.userId)
        .map((author) => ({
          value: author.userId?.toString() || `temp-${Date.now()}`,
          label: author.fullName || 'Unknown User',
        }));
    } catch (error) {
      console.error('Error searching people:', error);
      return [];
    }
  }, []);

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Contacts</SectionHeader>
      <SearchableMultiSelect
        value={contacts}
        onChange={(newContacts) => setValue('contacts', newContacts, { shouldValidate: true })}
        onAsyncSearch={handleAsyncSearch}
        placeholder="Search for contacts..."
        error={getFieldErrorMessage(errors.contacts, 'Invalid contacts')}
        debounceMs={500}
      />
    </div>
  );
}
