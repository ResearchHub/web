import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';
import { DraftWithAIPromo } from '@/components/HomePromo/DraftWithAIPromo';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout contentWidth="narrow">
      <HomeFeedsProvider>
        <HomeTabs />
        {/* Phones; from the tablet breakpoint up it is the toast instead. */}
        <DraftWithAIPromo variant="card" className="mb-6 tablet:!hidden" />
        <DraftWithAIPromo variant="toast" />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
