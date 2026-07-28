'use client';

import { Feather, Users, ExternalLink } from 'lucide-react';
import { editors } from './lib/journalConstants';
import { EditorCard } from './about/EditorCard';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';

interface RHJRightSidebarProps {
  showBanner?: boolean;
}

const quickLinks = [
  {
    href: 'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/researchhub-journal-rhj/author-guidelines',
    text: 'Author Guidelines',
    icon: Feather,
  },
  {
    href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    text: 'Apply to be a Reviewer',
    icon: Users,
  },
];

const JOURNAL_DOCS_URL =
  'https://docs.researchhub.com/researchhub-foundation/programs-and-initiatives/researchhub-journal-rhj';

const JOURNAL_FACTS = [
  {
    label: 'License',
    value: 'CC-BY 4.0',
    href: 'https://creativecommons.org/licenses/by/4.0/',
  },
  { label: 'Peer Review', value: 'Open access, unblinded, paid' },
  { label: 'APC', value: '$0 (Free)' },
] as const;

export function AboutTheJournal({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <div className="space-y-2">
      {showHeading && <h3 className="text-lg font-semibold text-gray-800">About the journal</h3>}
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
      <dl className="divide-y divide-gray-200 border-y border-gray-200">
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
    </div>
  );
}

export function RHJRightSidebar({ showBanner = true }: RHJRightSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Submit Button and Key Features Banner */}
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

      {/* Editorial Board Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Editorial Board</h3>
        <div className="space-y-3">
          {editors.map((editor) => (
            <EditorCard key={editor.name} editor={editor} />
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Resources</h3>
        <div className="space-y-2">
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <IconComponent size={16} className="text-primary-600" />
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

      {/* Journal Information Footnote */}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>ResearchHub Journal is published by ResearchHub.</div>
          <div>Address: ResearchHub, 548 Market Street PMB 26680, San Francisco, CA 94104, USA</div>
          <div>ISSN: 2837-5085</div>
        </div>
      </div>
    </div>
  );
}
