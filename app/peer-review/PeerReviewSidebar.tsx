import { ExternalLink, Feather, Info } from 'lucide-react';
import {
  CollapsibleEditorialBoardSection,
  EditorialBoardSection,
} from '@/components/Journal/RHJRightSidebar';
import { JournalCollapsibleSection } from '@/components/Journal/JournalCollapsibleSection';
import { cn } from '@/utils/styles';

interface SectionProps {
  className?: string;
}

const PEER_REVIEW_FACTS = [
  { label: 'Reward', value: '$150 in RSC' },
  { label: 'Paid per proposal', value: 'Top 2 reviews' },
  { label: 'Payout', value: '~10 days after acceptance' },
  { label: 'Visibility', value: 'Public, under your name' },
];

const RESOURCE_LINKS = [
  {
    href: 'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/peer-review-program/peer-review-guidelines',
    text: 'Peer review guidelines',
    icon: Feather,
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-800">{children}</h3>;
}

function PeerReviewFactList() {
  return (
    <dl className="divide-y divide-gray-200 border-t border-gray-200">
      {PEER_REVIEW_FACTS.map((fact) => (
        <div key={fact.label} className="flex items-baseline justify-between gap-3 py-2 text-sm">
          <dt className="flex-shrink-0 text-gray-500">{fact.label}</dt>
          <dd className="text-right font-medium text-gray-900">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PeerReviewFacts({ className }: SectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <SectionHeading>At a glance</SectionHeading>
      <PeerReviewFactList />
    </div>
  );
}

function PeerReviewResources({ className }: SectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <SectionHeading>Resources</SectionHeading>
      <div className="space-y-2">
        {RESOURCE_LINKS.map((link) => {
          const LinkIcon = link.icon;

          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-primary-600 transition-colors hover:text-primary-700"
            >
              <div className="flex items-center gap-2">
                <LinkIcon size={16} className="text-primary-600" />
                <span>{link.text}</span>
              </div>
              <div className="ml-4">
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function PeerReviewSidebar() {
  return (
    <div className="space-y-3">
      <PeerReviewFacts />
      <EditorialBoardSection className="pt-3" />
      <PeerReviewResources className="border-t border-gray-200 pt-3" />
    </div>
  );
}

const MOBILE_SECTION_CLASS = 'rounded-xl border-t-0 bg-gray-50 px-4 py-3';

/**
 * The right sidebar is hidden below `lg` and this page has no trigger for the
 * layout's mobile drawer, so phones get the same details here, collapsed so the
 * bounties stay near the top. Mirrors the journal page.
 */
export function MobilePeerReviewDetails() {
  return (
    <div className="my-4 space-y-2 lg:!hidden">
      <JournalCollapsibleSection
        title="Peer review details"
        icon={<Info size={16} />}
        className={MOBILE_SECTION_CLASS}
      >
        <PeerReviewFactList />
        <PeerReviewResources className="mt-4 border-t border-gray-200 pt-3" />
      </JournalCollapsibleSection>

      <CollapsibleEditorialBoardSection className={MOBILE_SECTION_CLASS} />
    </div>
  );
}
