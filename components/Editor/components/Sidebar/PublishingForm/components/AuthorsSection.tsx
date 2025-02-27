import { useFormContext } from 'react-hook-form';
import { Users, Plus } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

export function AuthorsSection() {
  const { register, watch } = useFormContext();
  const authors = watch('authors');

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Users}>Authors</SectionHeader>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <Plus className="h-4 w-4 text-gray-400" />
        Add authors to your work
      </div>
    </div>
  );
}
