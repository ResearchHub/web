import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

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
