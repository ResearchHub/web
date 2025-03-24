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

export function AuthorsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { users, isLoadingUsers } = useNotebookContext();
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
    }
  }, [users]);

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
