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
    href: 'https://drive.google.com/file/d/1qKlGnNSA-98kg-RhmTFKYVB85X0PJWYr/view?usp=sharing',
    text: 'Author Guidelines',
    icon: Feather,
  },
  {
    href: 'https://airtable.com/apptLQP8XMy1kaiID/pag5tkxt0V18Xobje/form',
    text: 'Apply to be a Reviewer',
    icon: Users,
  },
];

export function RHJRightSidebar({ showBanner = true }: RHJRightSidebarProps) {
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
          <div>ISSN: 3070-3395</div>
        </div>
      </div>
    </div>
  );
}
