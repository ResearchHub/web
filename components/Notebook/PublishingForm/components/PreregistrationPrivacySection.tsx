import { useFormContext } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { SectionHeader } from './SectionHeader';

const OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone on ResearchHub can view this preregistration.',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you and reviewers you grant access to can view it.',
  },
];

export function PreregistrationPrivacySection() {
  const { watch, setValue } = useFormContext();
  const isPublic = watch('isPublic');
  const value = isPublic === false ? 'private' : 'public';

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Lock}>Visibility</SectionHeader>
      <div className="mt-2">
        <RadioGroup
          options={OPTIONS}
          value={value}
          onChange={(next) => setValue('isPublic', next === 'public', { shouldValidate: true })}
          helperText="Visibility can only be set when the preregistration is created."
        />
      </div>
    </div>
  );
}
