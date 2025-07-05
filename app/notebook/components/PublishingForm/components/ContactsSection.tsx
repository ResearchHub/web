import { Users, X } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { AutocompleteSelect, SelectOption } from '@/components/ui/form/AutocompleteSelect';
import { useFormContext } from 'react-hook-form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { getFieldErrorMessage } from '@/utils/form';
import { useUser } from '@/contexts/UserContext';
import { SearchService } from '@/services/search.service';
import { AuthorSuggestion } from '@/types/search';
import { Button } from '@/components/ui/Button';

export function ContactsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { isLoadingUsers } = useNotebookContext();
  const { user: currentUser } = useUser();

  const contacts = watch('contacts') || [];

  // Search function for AutocompleteSelect
  const handleSearchContacts = async (query: string): Promise<SelectOption<AuthorSuggestion>[]> => {
    if (!query.trim()) return [];

    try {
      const results: AuthorSuggestion[] = await SearchService.suggestPeople(query);
      return results
        .filter((author) => author.userId) // Filter out suggestions without userId
        .map((author) => ({
          value: author.userId?.toString() || `temp-${Date.now()}`,
          label: author.fullName || 'Unknown User',
          data: author,
        }));
    } catch (error) {
      console.error('Error searching contacts:', error);
      return [];
    }
  };

  // Handle contact selection
  const handleContactSelect = (selectedOption: SelectOption<AuthorSuggestion> | null) => {
    if (selectedOption) {
      // Check if contact is already selected
      const isAlreadySelected = contacts.some(
        (contact: any) => contact.value === selectedOption.value
      );

      if (!isAlreadySelected) {
        const newContacts = [...contacts, selectedOption];
        setValue('contacts', newContacts, { shouldValidate: true });
      }
    }
  };

  // Handle contact removal
  const handleRemoveContact = (contactToRemove: SelectOption<AuthorSuggestion>) => {
    const newContacts = contacts.filter((contact: any) => contact.value !== contactToRemove.value);
    setValue('contacts', newContacts, { shouldValidate: true });
  };

  // Render selected contact option
  const renderContactOption = (
    option: SelectOption<AuthorSuggestion>,
    { focus, selected }: { selected: boolean; focus: boolean }
  ) => {
    const contactData = option.data;

    return (
      <li
        className={`relative cursor-pointer select-none py-2 px-3 rounded-md text-sm list-none ${
          focus ? 'bg-gray-100' : 'text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {contactData?.profileImage ? (
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img
                  src={contactData.profileImage}
                  alt={contactData.fullName || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</p>
            {contactData?.headline && (
              <p className="text-xs text-gray-600 truncate">{contactData.headline}</p>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Contacts</SectionHeader>

      {/* Contact Search */}
      <div className="mb-4">
        <AutocompleteSelect<AuthorSuggestion>
          value={null}
          onChange={handleContactSelect}
          onSearch={handleSearchContacts}
          placeholder={isLoadingUsers ? 'Loading contacts...' : 'Search for contacts...'}
          disabled={isLoadingUsers}
          error={getFieldErrorMessage(errors.contacts, 'Invalid contacts')}
          debounceMs={300}
          minSearchLength={2}
          renderOption={renderContactOption}
        />
      </div>

      {/* Selected Contacts Display */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Contacts:</p>
          <div className="space-y-2">
            {contacts.map((contact: any) => (
              <div
                key={contact.value}
                className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {contact.data?.profileImage ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={contact.data.profileImage}
                          alt={contact.data.fullName || ''}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {contact.label}
                      {contact.data?.userId === currentUser?.id?.toString() && (
                        <span className="text-gray-500 ml-1">(you)</span>
                      )}
                    </p>
                    {contact.data?.headline && (
                      <p className="text-xs text-gray-600">{contact.data.headline}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemoveContact(contact)}
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 text-gray-400 hover:text-red-600"
                  aria-label="Remove contact"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Add contacts who will be responsible for managing this grant. These contacts will receive
        important updates about the grant's progress.
      </p>
    </div>
  );
}
