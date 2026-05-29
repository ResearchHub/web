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
  const selectedGrant = watch('selectedGrant');
  const isLockedPrivate = selectedGrant?.applicationVisibility === 'PRIVATE';
  const value = isLockedPrivate || isPublic === false ? 'private' : 'public';

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Lock}>Visibility</SectionHeader>
      <div className="mt-2">
        {isLockedPrivate ? (
          <div className="flex items-start gap-2 rounded-lg border border-primary-600 bg-primary-50 p-3">
            <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" />
            <div className="flex-1">
              <p className="font-medium text-primary-900">Private</p>
              <p className="text-sm text-primary-700">
                Only you and reviewers you grant access to can view it.
              </p>
              <p className="mt-2 text-xs text-gray-600">
                This RFP requires private applications, so visibility is locked.
              </p>
            </div>
          </div>
        ) : (
          <RadioGroup
            options={OPTIONS}
            value={value}
            onChange={(next) => setValue('isPublic', next === 'public', { shouldValidate: true })}
            helperText="Visibility can only be set when the preregistration is created."
          />
        )}
      </div>
    </div>
  );
}
