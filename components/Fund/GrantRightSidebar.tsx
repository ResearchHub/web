'use client';

import React, { useState } from 'react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Icon } from '@/components/ui/icons/Icon';
import { CTACard } from '@/components/ui/CTACard';
import { Check, ExternalLink } from 'lucide-react';

export const GrantRightSidebar = () => {
  const [openSections, setOpenSections] = useState<string[]>(['why-proposal']); // Default open section

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      <CTACard
        title="Fund Smarter."
        description="Make every research dollar count with open access funding."
        bulletPoints={['Preregistered research', 'Open peer review', 'Regular progress updates']}
        buttonText="Open an RFP"
        buttonLink="/notebook?newGrant=true"
        iconName="fund2"
        iconColor="#2563eb"
        iconSize={20}
        variant="blue"
      />

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
            href="https://calendar.app.google/riCwbFUFaWavXfAn6"
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
