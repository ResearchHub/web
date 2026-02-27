import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useFormContext } from 'react-hook-form';
import { getFieldErrorMessage } from '@/utils/form';
import { UserSearchSelect } from '@/components/ui/form/UserSearchSelect';

export function AuthorsSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const authors = watch('authors') || [];

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>
      <UserSearchSelect
        value={authors}
        onChange={(newAuthors) => setValue('authors', newAuthors, { shouldValidate: true })}
        placeholder="Search for authors..."
        error={getFieldErrorMessage(errors.authors, 'Invalid authors')}
      />
    </div>
  );
}
