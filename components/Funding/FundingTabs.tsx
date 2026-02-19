'use client';

import { FC, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { cn } from '@/utils/styles';

interface FundingTabsProps {
  selectedGrantId?: number | null;
  className?: string;
  rightContent?: React.ReactNode;
}

function getShortTitle(title: string, wordCount: number = 3): string {
  const words = title.split(' ').slice(0, wordCount);
  return words.join(' ');
}

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export const FundingTabs: FC<FundingTabsProps> = ({ selectedGrantId, className, rightContent }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { grants, isLoading } = useGrants();

  const tabs = useMemo(() => {
    const grantTabs = grants.map((grant) => {
      const content = grant.content as FeedGrantContent;
      const grantData = content.grant;
      const amount = grantData?.amount?.usd;
      const amountLabel = amount ? ` · ${formatCompactAmount(amount)}` : '';

      return {
        id: `grant-${content.id}`,
        label: `${getShortTitle(content.title, 3)}${amountLabel}`,
        href: `/funding/${content.id}`,
      };
    });

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
    <div className={cn('flex items-center', className)}>
      <Tabs
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
        disabled={isLoading}
        variant="pill"
      />
      {rightContent && <div className="ml-auto flex-shrink-0">{rightContent}</div>}
    </div>
  );
};
