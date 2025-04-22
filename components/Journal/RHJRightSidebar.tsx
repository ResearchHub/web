'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopicAndJournalBadge } from '../ui/TopicAndJournalBadge';
import { Button } from '../ui/Button';
import { Check } from 'lucide-react';
import { Feather, Users, ArrowUpRightSquare } from 'lucide-react';
import { editors, HUBS } from './lib/journalConstants';
import { getHubSlug } from './lib/hubUtils';
import { EditorCard } from './about/EditorCard';

const keyFeatures = [
  { text: '14 days to peer reviews' },
  { text: '$150 paid to peer reviewers' },
  { text: 'Immediate preprint publication' },
  { text: 'Open access by default' },
];

const quickLinks = [
  {
    href: 'https://docs.google.com/document/d/1a3WrTSDOCvWXxWetbPn-TDav56Y7EFwpyzK5B8Ll3Io/edit?tab=t.0',
    text: 'Author Guidelines',
    icon: Feather,
  },
  {
    href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    text: 'Apply to be a Reviewer',
    icon: Users,
  },
];

export function RHJRightSidebar() {
  const router = useRouter();
  const [isHubsExpanded, setIsHubsExpanded] = useState(false);

  const displayedHubs = isHubsExpanded ? HUBS : HUBS.slice(0, 5);
  const displayEditors = editors.filter((editor) => editor.authorId !== null);

  return (
    <aside className="w-full max-w-xs space-y-6 p-4 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto no-scrollbar">
      {/* Submit Button and Key Features Banner */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm space-y-4">
        {/* Key Features List inside banner */}
        <ul className="space-y-2">
          {keyFeatures.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2 text-blue-800 text-sm">
              <Check className="text-blue-600 w-4 h-4 flex-shrink-0" />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        <Button
          variant="default"
          size="md"
          className="w-full font-medium"
          onClick={() => router.push('/paper/create')}
        >
          Submit Manuscript
        </Button>
      </div>

      {/* --- Editorial Board Section --- */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Editorial Board</h3>
        <div className="space-y-4">
          {displayEditors.map((editor) => (
            <EditorCard key={editor.name} editor={editor} />
          ))}
        </div>
        <a
          href={`mailto:maulik.editor@researchhub.foundation?subject=Joining%20ResearchHub%20Journal%20Editorial%20Board`}
          className="block text-sm text-blue-600 hover:underline pt-2"
        >
          Interested in joining?
        </a>
      </div>

      {/* Relevant Fields - Updated to link to Hubs and use TopicAndJournalBadge */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Relevant Fields</h3>
        <div className="flex flex-wrap gap-2">
          {displayedHubs.map((hubName) => (
            <TopicAndJournalBadge
              key={hubName}
              type="topic"
              name={hubName}
              slug={getHubSlug(hubName)}
              size="sm"
            />
          ))}
        </div>
        {HUBS.length > 5 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsHubsExpanded(!isHubsExpanded)}
            className="pt-1"
          >
            {isHubsExpanded ? 'Show Less' : `Show More (${HUBS.length - 5})`}
          </Button>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">Quick Links</h3>
        <ul className="space-y-2">
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <li key={index}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{link.text}</span>
                  <ArrowUpRightSquare className="w-3 h-3 text-gray-400 ml-1" />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
