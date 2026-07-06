'use client';

import { FC } from 'react';
import { Feather, Users, ExternalLink, BadgeCheck, Lock, Unlock } from 'lucide-react';
import { editors } from '@/components/Journal/lib/journalConstants';
import { EditorCard } from '@/components/Journal/about/EditorCard';
import { RightSidebarBanner } from '@/components/ui/RightSidebarBanner';

interface RegisteredReportsSidebarProps {
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

const howItWorks = [
  {
    icon: Unlock,
    title: 'Fund the question',
    description: 'Proposals are crowdfunded on ResearchHub before any data exists.',
  },
  {
    icon: Lock,
    title: 'Review the protocol',
    description: 'Methods are peer reviewed and locked before results are known.',
  },
  {
    icon: BadgeCheck,
    title: 'Publish either way',
    description: 'Accepted protocols are published regardless of how the results turn out.',
  },
];

/**
 * Right sidebar for the Journal of Registered Reports. Reuses the journal's
 * EditorCard + banner building blocks but reframed around the registered-report
 * lifecycle (funded proposals → locked protocols → published results).
 */
export const RegisteredReportsSidebar: FC<RegisteredReportsSidebarProps> = ({
  showBanner = true,
}) => {
  const displayEditors = editors.filter((editor) => editor.authorId !== null);

  return (
    <div className="space-y-4">
      {showBanner && (
        <RightSidebarBanner
          title="Publish results-blind."
          description="A journal for funded proposals — reviewed before the results are in."
          bulletPoints={[
            'Protocols reviewed pre-results',
            'In-principle acceptance',
            'Null results published too',
          ]}
          buttonText="Submit a Registered Report"
          buttonLink="/paper/create"
          iconName="rhJournal2"
          iconColor="#2563eb"
          iconSize={20}
          variant="blue"
        />
      )}

      {/* How registered reports work */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">How it works</h3>
        <div className="space-y-3">
          {howItWorks.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary-50 p-1.5">
                  <IconComponent size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs leading-snug text-gray-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                className="flex items-center justify-between text-sm text-primary-600 transition-colors hover:text-primary-700"
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
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="space-y-1 text-xs text-gray-500">
          <div>The Journal of Registered Reports is published by ResearchHub.</div>
          <div>Address: ResearchHub, 548 Market Street PMB 26680, San Francisco, CA 94104, USA</div>
          <div>ISSN: 3070-3401</div>
        </div>
      </div>
    </div>
  );
};
