import { useFormContext } from 'react-hook-form';
import { Building } from 'lucide-react';
import { Input } from '@/components/ui/form/Input';
import { SectionHeader } from './SectionHeader';

export function GrantOrganizationSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Building}>Organization</SectionHeader>
      <div className="mt-2">
        <Input
          {...register('organization')}
          placeholder="University, Company, Foundation, etc."
          error={errors.organization?.message?.toString()}
          helperText="The organization providing the funding"
          required
        />
      </div>
    </div>
  );
}
