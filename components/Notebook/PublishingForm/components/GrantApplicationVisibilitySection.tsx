import { useFormContext } from 'react-hook-form';
import { Eye } from 'lucide-react';
import { RadioGroup } from '@/components/ui/form/RadioGroup';
import { SectionHeader } from './SectionHeader';
import { CommunityMatchTooltip } from '@/components/tooltips/CommunityMatchTooltip';

const CommunityMatchBadge = () => (
  <CommunityMatchTooltip position="top">
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 cursor-default">
      Community match eligible
    </span>
  </CommunityMatchTooltip>
);

const OPTIONS = [
  {
    value: 'OPTIONAL',
    label: 'Applicant chooses',
    description: 'Applicants can submit either a public or a private proposals.',
  },
  {
    value: 'PUBLIC',
    label: 'Public only',
    description: 'Public proposals are visible to everyone browsing ResearchHub.',
    badge: <CommunityMatchBadge />,
  },
  {
    value: 'PRIVATE',
    label: 'Private only',
    description: 'Only yourself and peer-reviewers can view private proposals.',
  },
];

export function GrantApplicationVisibilitySection() {
  const { watch, setValue } = useFormContext();
  const value = watch('applicationVisibility') ?? 'OPTIONAL';

  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Eye}>Application Visibility</SectionHeader>
      <p className="mb-2 text-sm text-gray-500">Choose how applicants submit proposals</p>
      <div className="mt-2">
        <RadioGroup
          options={OPTIONS}
          value={value}
          onChange={(next) => setValue('applicationVisibility', next, { shouldValidate: true })}
          size="sm"
        />
      </div>
    </div>
  );
}
