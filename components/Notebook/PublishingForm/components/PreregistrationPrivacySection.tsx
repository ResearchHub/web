import { useFormContext } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { SectionHeader } from './SectionHeader';

const OPTIONS = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone on ResearchHub can view this proposal.',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you and peer-reviewers can view proposals.',
  },
];

function useIsLockedPrivate() {
  const { watch } = useFormContext();
  const selectedGrant = watch('selectedGrant');
  return selectedGrant?.applicationVisibility === 'PRIVATE';
}

export function PreregistrationPrivacyLockedAlert() {
  const isLockedPrivate = useIsLockedPrivate();

  if (!isLockedPrivate) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-primary-600 bg-primary-50 p-2.5">
      <Lock className="h-4 w-4 flex-shrink-0 text-primary-700" />
      <p className="text-sm text-primary-700">
        <span className="font-medium text-primary-900">Private submission.</span>
        {' Only funder and vetted peer-reviewers will be able to view your proposal.'}
      </p>
    </div>
  );
}

export function PreregistrationPrivacySection() {
  const { watch, setValue } = useFormContext();
  const isPublic = watch('isPublic');
  const isLockedPrivate = useIsLockedPrivate();

  if (isLockedPrivate) {
    return null;
  }

  const value = isPublic === false ? 'private' : 'public';

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Lock}>Visibility</SectionHeader>
      <div className="mt-2">
        <RadioGroup
          options={OPTIONS}
          value={value}
          onChange={(next) => setValue('isPublic', next === 'public', { shouldValidate: true })}
          size="sm"
        />
      </div>
    </div>
  );
}
