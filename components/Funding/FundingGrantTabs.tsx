'use client';

import { FC, useMemo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
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
  const { grants, fetchGrants } = useGrants();

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const activeTab = useMemo(() => {
    const grantMatch = pathname.match(/^\/(?:fund\/)?grant\/(\d+)/);
    if (grantMatch) return `grant-${grantMatch[1]}`;
    return 'all';
  }, [pathname]);

  const pillTabs = useMemo(() => {
    const allTab = {
      id: 'all',
      label: 'All',
      href: '/fund',
    };

    const grantTabs = grants.map((grant) => {
      const content = grant.content as FeedGrantContent;
      const amount = content.grant.amount?.usd;
      const amountFormatted = amount ? formatCompactAmount(amount) : null;
      const tabHref = `/fund/grant/${content.id}`;

      return {
        id: `grant-${content.id}`,
        label: (
          <span className="flex items-center gap-1">
            <span className="text-[10px] leading-none flex-shrink-0">🏆</span>
            <span className="truncate">
              {amountFormatted
                ? `${content.grant.shortTitle} · ${amountFormatted}`
                : content.grant.shortTitle}
            </span>
          </span>
        ),
        href: tabHref,
      };
    });

    return [allTab, ...grantTabs];
  }, [grants]);

  if (grants.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <PillTabs
        tabs={pillTabs}
        activeTab={activeTab}
        onTabChange={() => {}}
        size="md"
        colorScheme="default"
      />
      <Link
        href="/awards"
        className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
        title="Browse awards"
      >
        <LayoutGrid className="w-5 h-5" />
      </Link>
    </div>
  );
};
