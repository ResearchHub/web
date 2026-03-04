import { Users } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useFormContext } from 'react-hook-form';
import { getFieldErrorMessage } from '@/utils/form';
import { SearchableUserSelect } from '@/components/ui/form/SearchableUserSelect';

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
      <SearchableUserSelect
        value={authors}
        onChange={(newAuthors) => setValue('authors', newAuthors, { shouldValidate: true })}
        placeholder="Search for authors..."
        error={getFieldErrorMessage(errors.authors, 'Invalid authors')}
      />
    </div>
  );
}
