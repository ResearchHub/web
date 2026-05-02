'use client';

import React from 'react';
import { CollapsibleItem } from '@/components/ui/CollapsibleSection';
import { Card } from '@/components/ui/Card';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { YieldChart } from '@/components/charts/YieldChart';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { ExternalLink, Sprout, Star, Vote } from 'lucide-react';

import Icon from '@/components/ui/icons/Icon';

export const ResearchCoinRightSidebar = () => {
  const [openSections, setOpenSections] = React.useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="w-full">
      <div className="pb-4">
        {/* Supply Yield chart */}
        <div className="px-6 mb-5 mt-3">
          <SidebarHeader title="Supply yield" />
          <YieldChart
            compact
            height={120}
            showRangeSelector={false}
            title=""
            defaultRange="30d"
            showAxes={false}
            gradientFill
            showStats
          />
        </div>

        {/* Use ResearchCoin Section */}
        <div className="px-6 mb-4">
          <SidebarHeader title="Use ResearchCoin" />
          <div className="text-gray-600 text-sm space-y-0">
            <CollapsibleItem
              title="Fund research"
              icon={<Icon name="fund" size={16} color="#4b5563" />}
              isOpen={openSections.includes('fund-research')}
              onToggle={() => toggleSection('fund-research')}
            >
              <div className="mt-2 leading-relaxed">
                Support research aligned with a pre-registered proposal.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Tip contributions"
              icon={<Icon name="tipRSC" size={16} color="#4b5563" />}
              isOpen={openSections.includes('tip-contributions')}
              onToggle={() => toggleSection('tip-contributions')}
            >
              <div className="mt-2 leading-relaxed">
                Reward authors and reviewers for great contributions.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Govern the platform"
              icon={<Vote className="w-4 h-4 text-gray-600" />}
              isOpen={openSections.includes('governance')}
              onToggle={() => toggleSection('governance')}
            >
              <div className="mt-2 leading-relaxed">
                Vote on proposals and shape research incentives.
              </div>
            </CollapsibleItem>
          </div>
        </div>

        {/* Earn ResearchCoin Section */}
        <div className="px-6 mb-4">
          <SidebarHeader title="Earn ResearchCoin" />
          <div className="text-gray-600 text-sm space-y-0">
            <CollapsibleItem
              title="Create proposal"
              icon={<FundingIcon size={16} color="#4b5563" />}
              isOpen={openSections.includes('create-proposal')}
              onToggle={() => toggleSection('create-proposal')}
            >
              <div className="mt-2 leading-relaxed">
                Submit a research proposal for community funding.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Complete Peer Reviews"
              icon={<Star className="w-4 h-4 text-gray-600" />}
              isOpen={openSections.includes('complete-peer-reviews')}
              onToggle={() => toggleSection('complete-peer-reviews')}
            >
              <div className="mt-2 leading-relaxed">
                Earn RSC by peer reviewing preprints on ResearchHub.
              </div>
            </CollapsibleItem>

            <CollapsibleItem
              title="Stake tokens"
              icon={<Sprout className="w-4 h-4 text-gray-600" />}
              isOpen={openSections.includes('stake-tokens')}
              onToggle={() => toggleSection('stake-tokens')}
            >
              <div className="mt-2 leading-relaxed">
                Stake RSC and earn yield plus matching for funding.
              </div>
            </CollapsibleItem>
          </div>
        </div>

        {/* Resources Section */}
        <div className="px-6 mb-4">
          <SidebarHeader title="Resources" />
          <div className="space-y-2">
            <a
              href="https://blog.researchhub.foundation/researchcoin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 -mx-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-medium">Learn about ResearchCoin</span>
              </div>
              <div className="ml-4">
                <ExternalLink size={14} className="text-gray-400" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
