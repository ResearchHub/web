'use client';

import { FC, useMemo, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { PillTabs } from '@/components/ui/PillTabs';
import { useGrants } from '@/contexts/GrantContext';
import { FeedGrantContent } from '@/types/feed';
import { buildWorkUrl } from '@/utils/url';

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
    const grantTabs = grants.map((grant) => {
      const content = grant.content as FeedGrantContent;
      return {
        id: `grant-${content.id}`,
        label: content.grant.shortTitle,
        href: buildWorkUrl({ id: content.id, contentType: 'funding_request', slug: content.slug }),
      };
    });

    return [{ id: 'all', label: 'All', href: '/fund' }, ...grantTabs];
  }, [grants]);

  if (grants.length === 0) return null;

  if (useLegacyTabs) {
    return (
      <div className="h-full [&_.text-sm]:!text-base">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={() => {}}
          className="!border-b-0 h-full py-0"
        />
      </div>
    );
  }

  return <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={() => {}} />;
};
