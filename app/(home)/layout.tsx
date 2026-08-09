import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

/**
 * Shared shell for homepage tabs (Activity / Fund / Proposals).
 * Keeps PageLayout, HomeTabs, feed providers, and FundSidebar mounted while
 * only the feed slot swaps.
 *
 * `/fund/dashboard` lives outside this group and keeps its own layout.
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout rightSidebar={<FundSidebar />}>
      <HomeFeedsProvider>
        <HomeTabs />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
