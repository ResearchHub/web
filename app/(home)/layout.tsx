import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';
import { DraftWithAICard, DraftWithAIToast } from '@/components/AIMode/DraftWithAICard';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout contentWidth="narrow">
      <HomeFeedsProvider>
        <HomeTabs />
        {/* Phones; from the tablet breakpoint up it is the toast instead. */}
        <DraftWithAICard className="mb-6 tablet:!hidden" />
        <DraftWithAIToast />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
