import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

/**
 * Shared shell for feed-v2 tabs (Activity / Fund / Proposals).
 * Keeps PageLayout, tabs, feed providers, and FundSidebar mounted while
 * only the feed slot swaps.
 */
export default function FeedV2Layout({ children }: { children: ReactNode }) {
  return (
    <PageLayout rightSidebar={<FundSidebar />}>
      <HomeFeedsProvider>
        <HomeTabs />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
