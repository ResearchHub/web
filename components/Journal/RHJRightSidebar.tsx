'use client';

import { Feather, Users, ExternalLink } from 'lucide-react';
import { editors } from './lib/journalConstants';
import { EditorCard } from './about/EditorCard';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';

interface RHJRightSidebarProps {
  showBanner?: boolean;
  showAbout?: boolean;
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

const JOURNAL_FACTS = [
  { label: 'ISSN', value: '2837-5085' },
  { label: 'License', value: 'CC BY 4.0' },
  { label: 'APC', value: '$300' },
  { label: 'Peer review', value: 'Open · signed' },
  { label: 'Indexing', value: 'DOI via Crossref' },
] as const;

export function AboutTheJournal() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-base font-semibold text-gray-900">About the journal</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        A multidisciplinary open-access journal for studies funded on ResearchHub. Every article
        ships with its funding history, data, and signed reviews.
      </p>
      <dl className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
        {JOURNAL_FACTS.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-gray-500">{fact.label}</dt>
            <dd className="text-right font-medium text-gray-900">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function RHJRightSidebar({ showBanner = true, showAbout = true }: RHJRightSidebarProps) {
  const displayEditors = editors.filter((editor) => editor.authorId !== null);

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

      {showAbout && <AboutTheJournal />}

      {/* Editorial Board Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800">Editorial Board</h3>
        <div className="space-y-3">
          {displayEditors.map((editor) => (
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
