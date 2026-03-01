'use client';

import { FC, useMemo, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Tabs } from '@/components/ui/Tabs';
import { CardTabs } from '@/components/ui/CardTabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { buildWorkUrl } from '@/utils/url';
import { GrantPreviewTooltip } from '@/components/tooltips/GrantPreviewTooltip';

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
    const grantMatch = pathname.match(/^\/(?:fund\/)?grant\/(\d+)/);
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
      const grantDetailHref = buildWorkUrl({
        id: content.id,
        contentType: 'funding_request',
        slug: content.slug,
      });
      const tabHref = `/fund/grant/${content.id}`;

      const subtitle =
        proposalCount > 0
          ? `${proposalCount} proposal${proposalCount !== 1 ? 's' : ''}`
          : undefined;

      return {
        id: `grant-${content.id}`,
        amount: amountFormatted,
        title: content.grant.shortTitle,
        subtitle,
        href: tabHref,
        variant: 'grant' as const,
        renderWrapper: (children: ReactNode) => (
          <GrantPreviewTooltip
            href={grantDetailHref}
            title={content.grant.shortTitle}
            description={content.grant.description}
            image={content.previewImage ?? null}
            amount={String(content.grant.amount?.usd ?? 0)}
            currency="USD"
            numApplicants={proposalCount}
          >
            {children}
          </GrantPreviewTooltip>
        ),
      };
    });

    const allTab = {
      id: 'all',
      amount: totalUsd > 0 ? formatCompactAmount(totalUsd) : null,
      title: 'All',
      href: '/fund',
      variant: 'grant-summary' as const,
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

  return (
    <CardTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={() => {}}
      rightContent={
        <div className="flex items-center gap-2">
          <Link
            href="/grants"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Browse Awards
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/fund/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Award
          </Link>
        </div>
      }
    />
  );
};
