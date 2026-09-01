import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useFormContext } from 'react-hook-form';
import { getFieldErrorMessage } from '@/utils/form';
import { SearchableUserSelect } from '@/components/ui/form/SearchableUserSelect';
import { UserSuggestion } from '@/types/search';

const getContactId = (user: UserSuggestion) => user.id!.toString();

export function ContactsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const contacts = watch('contacts') || [];

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Contacts</SectionHeader>
      <SearchableUserSelect
        value={contacts}
        sortable
        onChange={(newContacts) => setValue('contacts', newContacts, { shouldValidate: true })}
        placeholder="Search for contacts..."
        error={getFieldErrorMessage(errors.contacts, 'Invalid contacts')}
        helperText="Add contacts who will manage this RFP and receive updates. Drag and drop contacts to arrange them in the order they should appear."
        getOptionValue={getContactId}
      />
    </div>
  );
}
