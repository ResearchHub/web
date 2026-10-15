import { CommunityMatchTooltip } from '@/components/tooltips/CommunityMatchTooltip';

const CommunityMatchBadge = () => (
  <CommunityMatchTooltip position="top">
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 cursor-default">
      Community match eligible
    </span>
  </CommunityMatchTooltip>
);

/** What the setting decides; shared with the workspace's publish dialog. */
export const GRANT_APPLICATION_VISIBILITY_HELP = 'Choose how applicants submit proposals';

/** How an RFP lets its applicants submit; shared with the workspace's publish dialog. */
export const GRANT_APPLICATION_VISIBILITY_OPTIONS = [
  {
    value: 'OPTIONAL',
    label: 'Applicant chooses',
    description: 'Applicants can submit either a public or a private proposal.',
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
