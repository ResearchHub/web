'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Icon } from '@/components/ui/icons/Icon';
import { CircleCheckBig, Check, ShieldAlert, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const GrantRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['why-proposal']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <Icon name="fund2" size={20} color="#2563eb" />
          Fund Smarter.
        </h3>
        <p className="text-gray-900 mb-3 text-sm">
          Make every research dollar count with open access funding.{' '}
        </p>
        <ul className="text-gray-900 mb-4 text-sm space-y-1">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            Preregistered research
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            Open peer review
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0 text-blue-500" strokeWidth={2.5} />
            Regular progress updates
          </li>
        </ul>
        <Button asChild className="w-full">
          <Link href="/notebook?newGrant=true">Open an RFP</Link>
        </Button>
      </div>

      {/* Resources Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Resources</h3>
        <div className="space-y-3">
          <a
            href=" https://drive.google.com/file/d/1VM8CueEvUhn4gZc3bNdrIRzSfZ9Tr8-j/view?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="fund" size={16} color="#2563eb" />
              <span>Funding on ResearchHub</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
          <a
            href="https://cal.com/arshiamalek/researchhub-funding"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Icon name="comment" size={16} color="#2563eb" />
              <span>Talk to the Team</span>
            </div>
            <div className="ml-4">
              <ExternalLink size={14} className="text-gray-400" />
            </div>
          </a>
        </div>
      </div>

      {/* Informational Sections */}
      <SimpleCollapsibleSection title="Open science = better science">
        <div className="pl-6">
          <CollapsibleItem
            title="Prevents p-hacking"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('prevents-hacking')}
            onToggle={() => toggleSection('prevents-hacking')}
          >
            When researchers outline analyses beforehand, they're reputationally incentivized to
            explain any deviations.
          </CollapsibleItem>

          <CollapsibleItem
            title="Incentivizes results sharing"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('forces-publication')}
            onToggle={() => toggleSection('forces-publication')}
          >
            By requiring pre-registration, we ensure that researchers share their findings
            regardless of the outcome.
          </CollapsibleItem>

          <CollapsibleItem
            title="Enables independent replication"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('enables-replication')}
            onToggle={() => toggleSection('enables-replication')}
          >
            Pre-registered protocols provide clear roadmaps for other researchers to replicate and
            build upon your work.
          </CollapsibleItem>

          <CollapsibleItem
            title="Expert review before funding"
            icon={<Check className="w-4 h-4" strokeWidth={2.5} />}
            isOpen={openSections.includes('expert-review')}
            onToggle={() => toggleSection('expert-review')}
          >
            Our peer review process ensures that only high-quality, well-designed studies receive
            funding.
          </CollapsibleItem>
        </div>
      </SimpleCollapsibleSection>
    </div>
  );
};
