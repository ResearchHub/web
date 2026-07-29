'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, Feather, Library, Users } from 'lucide-react';
import { editors } from './lib/journalConstants';
import { EditorCard } from './about/EditorCard';
import { JournalCollapsibleSection } from './JournalCollapsibleSection';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';
import { cn } from '@/utils/styles';

interface RHJRightSidebarProps {
  showBanner?: boolean;
}

interface JournalSectionProps {
  className?: string;
}

const QUICK_LINKS = [
  {
    href: '/journal-pioneers',
    text: 'The Pioneers',
    icon: Library,
    external: false,
  },
  {
    href: 'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/researchhub-journal-rhj/author-guidelines',
    text: 'Author Guidelines',
    icon: Feather,
    external: true,
  },
  {
    href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    text: 'Apply to be a Reviewer',
    icon: Users,
    external: true,
  },
];

const JOURNAL_DOCS_URL =
  'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/researchhub-journal-rhj';

const EDITOR_AVATARS = editors.map((editor) => ({
  src: typeof editor.image === 'string' ? editor.image : '',
  alt: editor.name,
}));

const JOURNAL_FACTS = [
  {
    label: 'License',
    value: 'CC-BY 4.0',
    href: 'https://creativecommons.org/licenses/by/4.0/',
  },
  { label: 'Peer Review', value: 'Open access, paid' },
  { label: 'APC', value: '$0 (Free)' },
] as const;

export function AboutTheJournalContent() {
  return (
    <>
      <p className="text-sm leading-relaxed text-gray-600">
        A multidisciplinary open-access, registered reports journal exclusively for studies funded
        on ResearchHub. These reports are accompanied with open-access, unblinded, and paid peer
        reviews to maximize broad engagement. Additionally, authors are incentivized to share
        optional monthly updates, to keep funders and readers informed of experimental progress.{' '}
        <a
          href={JOURNAL_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-primary-600 transition-colors hover:text-primary-700 hover:underline"
        >
          Learn more
        </a>
      </p>
      <dl className="mt-2 divide-y divide-gray-200 border-t border-gray-200">
        {JOURNAL_FACTS.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-3 py-2 text-sm">
            <dt className="flex-shrink-0 text-gray-500">{fact.label}</dt>
            <dd className="text-right font-medium text-gray-900">
              {'href' in fact && fact.href ? (
                <a
                  href={fact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {fact.value}
                </a>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-800">{children}</h3>;
}

export function AboutTheJournal({ className }: JournalSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <SectionHeading>About the journal</SectionHeading>
      <AboutTheJournalContent />
    </div>
  );
}

function EditorList() {
  return (
    <div className="space-y-3">
      {editors.map((editor) => (
        <EditorCard key={editor.name} editor={editor} />
      ))}
    </div>
  );
}

export function EditorialBoardSection({ className }: JournalSectionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <SectionHeading>Editorial Board</SectionHeading>
      <EditorList />
    </div>
  );
}

/** Compact variant for mobile, where the avatar stack previews the editors while collapsed. */
export function CollapsibleEditorialBoardSection({ className }: JournalSectionProps) {
  return (
    <JournalCollapsibleSection
      title="Editorial Board"
      icon={<Users size={16} />}
      collapsedPreview={
        <AvatarStack
          items={EDITOR_AVATARS}
          size="xs"
          maxItems={4}
          showExtraCount
          showLabel={false}
          disableTooltip
          ringColorClass="ring-gray-50"
        />
      }
      className={className}
    >
      <EditorList />
    </JournalCollapsibleSection>
  );
}

export function JournalResources({ className }: JournalSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <SectionHeading>Resources</SectionHeading>
        <div className="space-y-2">
          {QUICK_LINKS.map((link) => {
            const IconComponent = link.icon;
            const linkClassName =
              'flex items-center justify-between text-sm text-primary-600 transition-colors hover:text-primary-700';
            const label = (
              <div className="flex items-center gap-2">
                <IconComponent size={16} className="text-primary-600" />
                <span>{link.text}</span>
              </div>
            );

            return link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {label}
                <div className="ml-4">
                  <ExternalLink size={14} className="text-gray-400" />
                </div>
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={linkClassName}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="space-y-1 border-t border-gray-200 pt-3 text-xs text-gray-500">
        <div>ResearchHub Journal is published by ResearchHub.</div>
        <div>Address: ResearchHub, 548 Market Street PMB 26680, San Francisco, CA 94104, USA</div>
        <div>ISSN: 3070-3395</div>
      </div>
    </div>
  );
}

export function RHJRightSidebar({ showBanner = true }: RHJRightSidebarProps) {
  return (
    <div className="space-y-3">
      {showBanner && (
        <RightSidebarBanner
          title="Publish Faster."
          description="Where fast publishing meets open science."
          bulletPoints={['14 days to peer review', 'Immediate preprints', 'Open access by default']}
          buttonText="Submit Your Manuscript"
          buttonLink="/paper/create"
          iconName="rhJournal2"
          iconColor="#2563eb"
          iconSize={20}
          variant="blue"
        />
      )}

      <EditorialBoardSection className="pt-3" />

      <JournalResources className="border-t border-gray-200 pt-3" />
    </div>
  );
}
