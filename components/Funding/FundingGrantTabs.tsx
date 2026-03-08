'use client';

import { FC, useMemo, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { PillTabs } from '@/components/ui/PillTabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export const FundingGrantTabs: FC = () => {
  const pathname = usePathname();
  const { grants, isLoading, fetchGrants } = useGrants();
  const hasFetchedRef = useRef(grants.length > 0);

  useEffect(() => {
    fetchGrants().then(() => {
      hasFetchedRef.current = true;
    });
  }, [fetchGrants]);

  const isPending = !hasFetchedRef.current && grants.length === 0;

  const activeTab = useMemo(() => {
    if (pathname === '/awards') return 'browse';
    const grantMatch = pathname.match(/^\/(?:fund\/)?grant\/(\d+)/);
    if (grantMatch) return `grant-${grantMatch[1]}`;
    return 'all';
  }, [pathname]);

  const pillTabs = useMemo(() => {
    const browseTab = {
      id: 'browse',
      label: 'Browse',
      href: '/awards',
      icon: LayoutGrid,
    };

    const allTab = {
      id: 'all',
      label: 'All',
      href: '/fund',
    };

    const grantTabs = grants.map((grant, idx) => {
      const content = grant.content as FeedGrantContent;
      const amount = content.grant.amount?.usd;
      const amountFormatted = amount ? formatCompactAmount(amount) : null;
      const tabHref = `/fund/grant/${content.id}`;
      const isActive = activeTab === `grant-${content.id}`;

      return {
        id: `grant-${content.id}`,
        separator: idx === 0,
        label: (
          <span className="flex items-center gap-1">
            <span className="truncate">{content.grant.shortTitle}</span>
            {amountFormatted && (
              <span className={`font-mono ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                · {amountFormatted}
              </span>
            )}
          </span>
        ),
        href: tabHref,
      };
    });

    return [browseTab, allTab, ...grantTabs];
  }, [grants, activeTab]);

  if (grants.length === 0) {
    if (isLoading || isPending) {
      const widths = [48, 128, 112, 96, 120, 104, 88, 132, 100, 116];
      return (
        <div className="flex items-center gap-2 py-2 overflow-hidden">
          {widths.map((w, i) => (
            <div
              key={i}
              className="h-[30px] rounded-lg bg-gray-100 animate-pulse flex-shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <PillTabs
      className="min-w-0"
      tabs={pillTabs}
      activeTab={activeTab}
      onTabChange={() => {}}
      size="lg"
      colorScheme="default"
      scrollCacheKey="funding-grants-topbar"
    />
  );
};
