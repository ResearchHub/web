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
        onChange={(newContacts) => setValue('contacts', newContacts, { shouldValidate: true })}
        placeholder="Search for contacts..."
        error={getFieldErrorMessage(errors.contacts, 'Invalid contacts')}
        helperText="Add contacts who will be responsible for managing this funding opportunity. These contacts will receive important updates about its progress."
        getOptionValue={getContactId}
      />
    </div>
  );
}
