import { useFormContext } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/form/Textarea';
import { SectionHeader } from './SectionHeader';

export function GrantDescriptionSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={FileText}>Short Description</SectionHeader>
      <div className="mt-2">
        <Textarea
          {...register('shortDescription')}
          placeholder="Describe what this grant is for and what you're looking to fund"
          error={errors.shortDescription?.message?.toString()}
          helperText="Describe what this grant is for and what you're looking to fund"
          required
        />
      </div>
    </div>
  );
}
