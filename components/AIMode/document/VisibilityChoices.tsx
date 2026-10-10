'use client';

import { Globe, Lock, User, type LucideIcon } from 'lucide-react';
import { GRANT_APPLICATION_VISIBILITY_OPTIONS } from '@/components/Notebook/PublishingForm/components/GrantApplicationVisibilitySection';
import { PROPOSAL_VISIBILITY_OPTIONS } from '@/components/Notebook/PublishingForm/components/PreregistrationPrivacySection';
import type { PublishingFormData } from '@/components/Notebook/PublishingForm/schema';
import { ChoiceList, type ChoiceCount } from './ChoiceList';

export type ApplicationVisibility = NonNullable<PublishingFormData['applicationVisibility']>;
type ProposalVisibility = 'public' | 'private';

/** What each way is, for a funder who has not met public and private proposals. */
const APPLICATION_DESCRIPTIONS: Record<ApplicationVisibility, string> = {
  OPTIONAL: 'Applicants can choose to make their proposal public or private.',
  PUBLIC: 'Every proposal is posted for anyone to read.',
  PRIVATE: 'Only you and peer reviewers see proposals.',
};

const APPLICATION_ICONS: Record<ApplicationVisibility, LucideIcon> = {
  PUBLIC: Globe,
  PRIVATE: Lock,
  OPTIONAL: User,
};

/** The order the options are listed in: the two plain choices, then the one that leaves it to the applicant. */
const APPLICATION_ORDER: readonly ApplicationVisibility[] = ['PUBLIC', 'PRIVATE', 'OPTIONAL'];

/** What leaving it to the applicant means, without calling either side a plus or a minus. */
const APPLICANT_CHOOSES_NOTES = [
  'Public proposals: anyone can read and co-fund them',
  'Private proposals: only you and peer reviewers see them',
];

const APPLICATION_OPTIONS = APPLICATION_ORDER.map((value) => ({
  value,
  label:
    GRANT_APPLICATION_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label ?? value,
  icon: APPLICATION_ICONS[value],
  description: APPLICATION_DESCRIPTIONS[value],
  // Whether this is better depends on what the funder wants, so it is said plainly, not weighed.
  notes: value === 'OPTIONAL' ? APPLICANT_CHOOSES_NOTES : undefined,
}));

/** What each plain way of taking applications gives the funder. */
const APPLICATION_COUNTS: readonly ChoiceCount<ApplicationVisibility>[] = [
  { label: 'Anyone can read them', marks: { PUBLIC: 'yes', PRIVATE: 'no' } },
  { label: 'Community co-funding enabled', marks: { PUBLIC: 'yes', PRIVATE: 'no' } },
  { label: "Applicant's proposal stays private", marks: { PUBLIC: 'no', PRIVATE: 'yes' } },
];

/** How an RFP's applicants may submit, and what each way gives the funder. */
export function ApplicationVisibilityChoice({
  value,
  onChange,
}: {
  readonly value: ApplicationVisibility;
  readonly onChange: (value: ApplicationVisibility) => void;
}) {
  return (
    <ChoiceList
      label="Application visibility"
      options={APPLICATION_OPTIONS}
      counts={APPLICATION_COUNTS}
      value={value}
      onChange={onChange}
    />
  );
}

/** What each visibility is. A private proposal goes to an RFP's funder, so it needs an RFP. */
const PROPOSAL_DESCRIPTIONS: Record<ProposalVisibility, string> = {
  public: 'Posted on ResearchHub for anyone to read.',
  private: "Only the RFP's funder and peer reviewers see it.",
};

const PROPOSAL_OPTIONS = PROPOSAL_VISIBILITY_OPTIONS.map((option) => ({
  value: option.value as ProposalVisibility,
  label: option.label,
  icon: option.value === 'public' ? Globe : Lock,
  description: PROPOSAL_DESCRIPTIONS[option.value as ProposalVisibility],
}));

/** What each visibility gives the proposal's authors. */
const PROPOSAL_COUNTS: readonly ChoiceCount<ProposalVisibility>[] = [
  { label: 'Anyone can read it', marks: { public: 'yes', private: 'no' } },
  { label: 'Community co-funding', marks: { public: 'yes', private: 'no' } },
  { label: 'Stays confidential', marks: { public: 'no', private: 'yes' } },
];

/** Who can see a proposal, and what each choice gives its authors. */
export function ProposalVisibilityChoice({
  isPublic,
  onChange,
}: {
  readonly isPublic: boolean;
  readonly onChange: (isPublic: boolean) => void;
}) {
  return (
    <ChoiceList
      label="Visibility"
      options={PROPOSAL_OPTIONS}
      counts={PROPOSAL_COUNTS}
      value={isPublic ? 'public' : 'private'}
      onChange={(next) => onChange(next === 'public')}
    />
  );
}
