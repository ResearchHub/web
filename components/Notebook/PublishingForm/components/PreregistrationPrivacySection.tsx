import { useFormContext } from 'react-hook-form';

/** Who can see a proposal; shared with the workspace's publish dialog. */
export const PROPOSAL_VISIBILITY_OPTIONS = [
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

/** The chosen RFP only takes private proposals, so the proposal cannot be public. */
export function useIsLockedPrivate() {
  const { watch } = useFormContext();
  const selectedGrant = watch('selectedGrant');
  return selectedGrant?.applicationVisibility === 'PRIVATE';
}

export function useShowPrivateWarning() {
  const { watch } = useFormContext();
  const isPublic = watch('isPublic');
  const selectedGrant = watch('selectedGrant');
  const isLockedPrivate = useIsLockedPrivate();
  if (isLockedPrivate) return false;
  const value = isPublic === false ? 'private' : 'public';
  return value === 'private' && !selectedGrant;
}
