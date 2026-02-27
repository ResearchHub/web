'use client';

import { FC, useMemo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { CardTabs } from '@/components/ui/CardTabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { buildWorkUrl } from '@/utils/url';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export const FundingGrantTabs: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { grants, fetchGrants } = useGrants();
  const useLegacyTabs = searchParams.get('exp') === 'tabs';

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const activeTab = useMemo(() => {
    const grantMatch = pathname.match(/^\/grant\/(\d+)/);
    if (grantMatch) return `grant-${grantMatch[1]}`;
    return 'all';
  }, [pathname]);

  const tabs = useMemo(() => {
    const totalUsd = grants.reduce((sum, grant) => {
      const content = grant.content as FeedGrantContent;
      return sum + (content.grant.amount?.usd ?? 0);
    }, 0);

    const grantTabs = grants.map((grant) => {
      const content = grant.content as FeedGrantContent;
      const proposalCount = content.grant.applicants?.length ?? 0;
      const amount = content.grant.amount?.usd;
      const amountFormatted = amount ? formatCompactAmount(amount) : null;

      const subtitle =
        proposalCount > 0
          ? `${proposalCount} proposal${proposalCount !== 1 ? 's' : ''}`
          : undefined;

      return {
        id: `grant-${content.id}`,
        amount: amountFormatted,
        title: content.grant.shortTitle,
        subtitle,
        href: buildWorkUrl({ id: content.id, contentType: 'funding_request', slug: content.slug }),
      };
    });

    const allTab = {
      id: 'all',
      amount: totalUsd > 0 ? formatCompactAmount(totalUsd) : null,
      title: 'All awards',
      href: '/fund',
    };

    return [allTab, ...grantTabs];
  }, [grants]);

  if (grants.length === 0) return null;

  if (useLegacyTabs) {
    const legacyTabs = tabs.map((t) => ({
      id: t.id,
      label: t.amount ? `${t.title} · ${t.amount}` : t.title,
      href: t.href,
    }));

    return (
      <div className="h-full [&_.text-sm]:!text-base">
        <Tabs
          tabs={legacyTabs}
          activeTab={activeTab}
          onTabChange={() => {}}
          className="!border-b-0 h-full py-0"
        />
      </div>
    );
  }

  return <CardTabs tabs={tabs} activeTab={activeTab} onTabChange={() => {}} />;
};
