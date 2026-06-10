import { useFormContext } from 'react-hook-form';
import { Lock, AlertTriangle } from 'lucide-react';
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
    <div className="flex items-start gap-2 rounded-lg border border-primary-600 bg-primary-50 p-3">
      <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-700" />
      <div className="flex-1">
        <p className="font-medium text-primary-900">Private</p>
        <p className="text-sm text-primary-700">
          Only you and reviewers you grant access to can view it.
        </p>
      </div>
    </div>
  );
}

export function PreregistrationPrivacySection() {
  const { watch, setValue } = useFormContext();
  const isPublic = watch('isPublic');
  const selectedGrant = watch('selectedGrant');
  const isLockedPrivate = useIsLockedPrivate();

  if (isLockedPrivate) {
    return null;
  }

  const value = isPublic === false ? 'private' : 'public';
  const showPrivateWarning = value === 'private' && !selectedGrant;

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
        {showPrivateWarning && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              In order to submit a private proposal, you must select a funding opportunity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
