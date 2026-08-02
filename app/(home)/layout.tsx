import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { HomeTabs } from '@/components/Funding/HomeTabs';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout rightSidebar={<FundSidebar />}>
      <HomeTabs />
      {children}
    </PageLayout>
  );
}
