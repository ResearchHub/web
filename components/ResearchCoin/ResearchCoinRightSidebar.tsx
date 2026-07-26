'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, Sprout, Star, Vote } from 'lucide-react';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Tooltip } from '@/components/ui/Tooltip';
import Icon from '@/components/ui/icons/Icon';

interface SidebarItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
}

const useItems: SidebarItem[] = [
  {
    title: 'Fund research',
    description: 'Support open research proposals on the platform.',
    icon: <Icon name="fund" size={16} color="#4b5563" />,
    href: '/fund/proposals',
  },
  {
    title: 'Open Funding Opportunity',
    description: 'Fund specific research you care about.',
    icon: <FundingIcon size={16} color="#4b5563" />,
    href: '/fund',
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
    href: 'https://snapshot.org/#/s:researchhub.eth',
    external: true,
  },
];

const earnItems: SidebarItem[] = [
  {
    title: 'Create proposal',
    description: 'Submit a research proposal for community funding.',
    icon: <FundingIcon size={16} color="#4b5563" />,
    href: '/fund/proposals',
  },
  {
    title: 'Complete Peer Reviews',
    description: 'Earn RSC by peer reviewing preprints or proposals on ResearchHub.',
    icon: <Star className="w-4 h-4 text-gray-600" />,
    href: '/earn',
  },
  {
    title: 'Create endowment',
    description: 'Lock RSC in an endowment and earn yield in the form of funding credits.',
    icon: <Sprout className="w-4 h-4 text-gray-600" />,
    href: '/researchcoin',
  },
];

function SidebarRow({ title, description, icon, href, external }: SidebarItem) {
  const tooltipContent = (
    <div className="text-left">
      <div className="text-sm font-bold text-white mb-1">{title}</div>
      <p className="text-xs text-gray-300 leading-snug mb-2">{description}</p>
      {href &&
        (external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 font-semibold text-xs inline-flex items-center gap-0.5"
          >
            Learn more <span className="text-[10px]">→</span>
          </a>
        ) : (
          <Link
            href={href}
            className="text-primary-400 hover:text-primary-300 font-semibold text-xs inline-flex items-center gap-0.5"
          >
            Learn more <span className="text-[10px]">→</span>
          </Link>
        ))}
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
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
        {/* Use ResearchCoin Section */}
        <SidebarHeader title="Use ResearchCoin" />
        <div className="pl-1 ml-1 mb-4">
          {useItems.map((item) => (
            <SidebarRow key={item.title} {...item} />
          ))}
        </div>

        {/* Earn ResearchCoin Section */}
        <SidebarHeader title="Earn ResearchCoin" />
        <div className="pl-1 ml-1 mb-4">
          {earnItems.map((item) => (
            <SidebarRow key={item.title} {...item} />
          ))}
        </div>

        {/* Resources Section */}
        <SidebarHeader title="Resources" />
        <div className="space-y-2 pl-1 ml-1 mb-4">
          <a
            href="https://docs.researchhub.com/researchcoin/what-is-researchcoin"
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
  );
};
