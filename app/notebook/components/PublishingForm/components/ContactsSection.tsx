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
import { UserSuggestion } from '@/types/search';

export function ContactsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const contacts = watch('contacts') || [];

  // Helper function for async user search
  const handleAsyncSearch = useCallback(async (query: string): Promise<MultiSelectOption[]> => {
    try {
      const suggestions = await SearchService.getSuggestions(query, 'user');

      // Filter to user suggestions with an id and map to options
      return suggestions
        .filter((s): s is UserSuggestion => s.entityType === 'user' && !!s.id)
        .map((user) => ({
          value: user.id!.toString(),
          label: user.displayName || 'Unknown User',
        }));
    } catch (error) {
      console.error('Error searching users:', error);
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
        helperText="Add contacts who will be responsible for managing this RFP. These contacts will receive important updates about the RFP's progress."
      />
    </div>
  );
}
