'use client';

import React from 'react';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { YieldChart } from '@/components/charts/YieldChart';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { ExternalLink, Sprout, Star, Vote } from 'lucide-react';

import Icon from '@/components/ui/icons/Icon';

interface SidebarItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const useItems: SidebarItem[] = [
  {
    title: 'Fund research',
    description: 'Support open research proposals on the platform.',
    icon: <Icon name="fund" size={16} color="#4b5563" />,
  },
  {
    title: 'Tip contributions',
    description: 'Reward authors and reviewers for great contributions.',
    icon: <Icon name="tipRSC" size={16} color="#4b5563" />,
  },
  {
    title: 'Govern the platform',
    description: 'Vote on proposals and shape research incentives.',
    icon: <Vote className="w-4 h-4 text-gray-600" />,
  },
];

const earnItems: SidebarItem[] = [
  {
    title: 'Create proposal',
    description: 'Submit a research proposal for community funding.',
    icon: <FundingIcon size={16} color="#4b5563" />,
  },
  {
    title: 'Complete Peer Reviews',
    description: 'Earn RSC by peer reviewing preprints or proposals on ResearchHub.',
    icon: <Star className="w-4 h-4 text-gray-600" />,
  },
  {
    title: 'Stake tokens',
    description: 'Stake RSC and earn yield in the form of funding credits.',
    icon: <Sprout className="w-4 h-4 text-gray-600" />,
  },
];

function SidebarRow({ title, description, icon }: SidebarItem) {
  return (
    <Tooltip
      content={
        <div className="text-left">
          <div className="text-sm font-bold text-white mb-1">{title}</div>
          <p className="text-xs text-gray-300 leading-snug">{description}</p>
        </div>
      }
      position="left"
      width="w-64"
      className="bg-gray-900 text-white border-gray-900 text-left"
    >
      <div className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-default">
        <div className="text-primary-600 flex-shrink-0">{icon}</div>
        <div className="text-sm font-medium">{title}</div>
      </div>
    </Tooltip>
  );
}

export const ResearchCoinRightSidebar = () => {
  return (
    <div className="w-full">
      <div className="pb-4">
        {/* Annualized Yield chart */}
        <div className="px-6 mb-5 mt-3">
          <SidebarHeader title="Annualized Yield" />
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
          <div className="pl-1 ml-1">
            {useItems.map((item) => (
              <SidebarRow key={item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Earn ResearchCoin Section */}
        <div className="px-6 mb-4">
          <SidebarHeader title="Earn ResearchCoin" />
          <div className="pl-1 ml-1">
            {earnItems.map((item) => (
              <SidebarRow key={item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div className="px-6 mb-4">
          <SidebarHeader title="Resources" />
          <div className="space-y-2 pl-1 ml-1">
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
