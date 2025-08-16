'use client';

import React from 'react';
import { CollapsibleItem, SimpleCollapsibleSection } from '@/components/ui/CollapsibleSection';
import { Card } from '@/components/ui/Card';
import { ExternalLink } from 'lucide-react';

import Icon from '@/components/ui/icons/Icon';

export const ResearchCoinRightSidebar = () => {
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="w-80 sticky top-[64px] h-[calc(100vh-64px)] bg-white/95 backdrop-blur-md border-gray-100 overscroll-contain">
      <div className="h-full overflow-y-auto pb-16 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {/* Resources Section */}
        <div className="px-6 mb-4 mt-3">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Resources</h3>
          <div className="space-y-2">
            <a
              href="https://blog.researchhub.foundation/researchcoin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 -mx-3"
            >
              <div className="flex items-center gap-2.5">
                <Icon name="earn2" size={16} color="#2563eb" />
                <span className="font-medium">About RSC</span>
              </div>
              <div className="ml-4">
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            </a>
          </div>
        </div>

        {/* RSC Utility Section */}
        <SimpleCollapsibleSection title="Use ResearchCoin" className="px-6 mb-3">
          <div className="text-gray-600 text-sm space-y-0 pl-7">
            <CollapsibleItem
              title="Create bounties"
              icon={<Icon name="createBounty" size={14} />}
              isOpen={openSections.includes('create-reward')}
              onToggle={() => toggleSection('create-reward')}
            >
              <div className="mt-2 leading-relaxed">
                RSC empowers the bounty system on ResearchHub, connecting researchers with tailored
                opportunities. Users can create bounties to engage experts for tasks like data
                processing and literature reviews.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Fund open science"
              icon={<Icon name="fundYourRsc2" size={14} />}
              isOpen={openSections.includes('fund-science')}
              onToggle={() => toggleSection('fund-science')}
            >
              <div className="mt-2 leading-relaxed">
                RSC enables the community to fund scientific projects through open access proposals,
                streamlining the funding process.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Tip authors"
              icon={<Icon name="fund" size={14} />}
              isOpen={openSections.includes('tip-authors')}
              onToggle={() => toggleSection('tip-authors')}
            >
              <div className="mt-2 leading-relaxed">
                RSC incentivizes actions in the ResearchHub ecosystem, providing targeted rewards
                for individual contributions and broader research goals.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Govern the platform"
              icon={<Icon name="settings" size={14} />}
              isOpen={openSections.includes('governance')}
              onToggle={() => toggleSection('governance')}
            >
              <div className="mt-2 leading-relaxed">
                RSC puts governance in the hands of researchers, allowing them to collectively shape
                the incentive structures in their fields. Through voting and proposal mechanisms,
                the research community can determine how to best reward different types of
                contributions.
              </div>
            </CollapsibleItem>
          </div>
        </SimpleCollapsibleSection>

        {/* Earning Section */}
        <SimpleCollapsibleSection title="Earn ResearchCoin" className="px-6">
          <div className="text-gray-600 text-sm space-y-0 pl-7">
            <CollapsibleItem
              title="Share a peer review"
              icon={<Icon name="peerReview1" size={14} />}
              isOpen={openSections.includes('peer-review')}
              onToggle={() => toggleSection('peer-review')}
            >
              <div className="mt-2 leading-relaxed">
                Researchers earn RSC by peer reviewing preprints on ResearchHub. After verifying
                identity, peer review opportunities will be surfaced.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Complete a bounty"
              icon={<Icon name="earn1" size={14} />}
              isOpen={openSections.includes('answer-reward')}
              onToggle={() => toggleSection('answer-reward')}
            >
              <div className="mt-2 leading-relaxed">
                Researchers earn RSC by completing bounties on ResearchHub, from peer reviews to
                specialized research assistance, allowing monetization of expertise.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Do reproducible research"
              icon={<Icon name="workType" size={14} />}
              isOpen={openSections.includes('reproducible-research')}
              onToggle={() => toggleSection('reproducible-research')}
            >
              <div className="mt-2 leading-relaxed">
                Authors earn RSC on their published papers, earning multipliers for open science
                practices to promote transparency and reproducibility in research.
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-600 font-medium text-xs">•</span>
                    <span className="text-sm">(Required): Open access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-600 font-medium text-xs">•</span>
                    <span className="text-sm">2x: Has open data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-600 font-medium text-xs">•</span>
                    <span className="text-sm">3x: Was preregistered</span>
                  </div>
                </div>
              </div>
            </CollapsibleItem>
          </div>
        </SimpleCollapsibleSection>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
    </div>
  );
};
