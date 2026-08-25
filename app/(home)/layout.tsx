import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout contentWidth="narrow">
      <HomeFeedsProvider>
        <HomeTabs />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
