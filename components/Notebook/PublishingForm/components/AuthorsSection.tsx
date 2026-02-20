import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import {
  SearchableMultiSelect,
  MultiSelectOption,
} from '@/components/ui/form/SearchableMultiSelect';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNotebookContext } from '@/contexts/NotebookContext';
import { getFieldErrorMessage } from '@/utils/form';
import { useUser } from '@/contexts/UserContext';

export function AuthorsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { users, isLoadingUsers, currentNote } = useNotebookContext();
  const { user: currentUser } = useUser();
  const [authorOptions, setAuthorOptions] = useState<MultiSelectOption[]>([]);

  const authors = watch('authors') || [];

  useEffect(() => {
    if (users?.users) {
      const options = users.users
        .filter((user) => user.name || user.email)
        .map((user) => ({
          value: user.authorId.toString(),
          label: user.name || user.email || 'Unknown User',
        }));

      setAuthorOptions(options);

      // Auto-add admin if no authors are selected yet
      if (authors.length === 0) {
        const admin = users.users.find((user) => user.id === currentUser?.id.toString());

        if (admin) {
          const adminOption = {
            value: admin.authorId.toString(),
            label: admin.name || admin.email || 'Unknown User',
          };
          setValue('authors', [adminOption], { shouldValidate: true });
        }
      }
    }
  }, [users, setValue, currentNote]);

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>
      <SearchableMultiSelect
        value={authors}
        onChange={(newAuthors) => setValue('authors', newAuthors, { shouldValidate: true })}
        options={authorOptions}
        placeholder={isLoadingUsers ? 'Loading authors...' : 'Search for authors...'}
        disabled={isLoadingUsers}
        error={getFieldErrorMessage(errors.authors, 'Invalid authors')}
      />
    </div>
  );
}
