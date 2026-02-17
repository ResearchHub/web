'use client';

import { FC, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { cn } from '@/utils/styles';

interface FundingTabsProps {
  /** Currently selected grant ID */
  selectedGrantId?: number | null;
  className?: string;
}

/**
 * Extracts the first N words from a title
 */
function getShortTitle(title: string, wordCount: number = 3): string {
  const words = title.split(' ').slice(0, wordCount);
  return words.join(' ');
}

export const FundingTabs: FC<FundingTabsProps> = ({ selectedGrantId, className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { grants, isLoading } = useGrants();

  // Build tabs from grants
  const tabs = useMemo(() => {
    const grantTabs = grants.map((grant) => {
      const content = grant.content as FeedGrantContent;
      const grantData = content.grant;

      return {
        id: `grant-${content.id}`,
        label: getShortTitle(content.title, 3),
        href: `/funding/${content.id}`,
      };
    });

    // Add "All" tab at the beginning
    return [
      {
        id: 'all',
        label: 'All',
        href: '/funding',
      },
      ...grantTabs,
    ];
  }, [grants]);

  // Determine active tab (selectedGrantId is now the post ID)
  const activeTab = useMemo(() => {
    if (selectedGrantId) {
      return `grant-${selectedGrantId}`;
    }
    // Check if we're on the main /funding page
    if (pathname === '/funding') {
      return 'all';
    }
    return 'all';
  }, [selectedGrantId, pathname]);

  const handleTabChange = (tabId: string, e?: React.MouseEvent) => {
    // Prevent default link behavior if using custom navigation
    if (e) {
      e.preventDefault();
    }

    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.href) {
      router.push(tab.href);
    }
  };

  return (
    <div className={cn('h-[64px]', className)}>
      <Tabs
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
        disabled={isLoading}
        className="h-full"
      />
    </div>
  );
};
