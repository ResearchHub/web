import { useFormContext } from 'react-hook-form';
import { Eye } from 'lucide-react';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { SectionHeader } from './SectionHeader';

const OPTIONS = [
  {
    value: 'OPTIONAL',
    label: 'Applicant chooses',
    description: 'Applicants can submit either a public or a private preregistration.',
  },
  {
    value: 'PUBLIC',
    label: 'Public only',
    description: 'Applications must be public preregistrations visible to everyone.',
  },
  {
    value: 'PRIVATE',
    label: 'Private only',
    description: 'Applications must be private preregistrations shared only with reviewers.',
  },
];

export function GrantApplicationVisibilitySection() {
  const { watch, setValue } = useFormContext();
  const value = watch('applicationVisibility') ?? 'OPTIONAL';

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Eye}>Application Visibility</SectionHeader>
      <div className="mt-2">
        <RadioGroup
          options={OPTIONS}
          value={value}
          onChange={(next) => setValue('applicationVisibility', next, { shouldValidate: true })}
          helperText="Controls whether applicants must submit public or private preregistrations."
        />
      </div>
    </div>
  );
}
