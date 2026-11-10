import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';
import {
  HomeAnnouncementCard,
  HomeAnnouncementToast,
} from '@/components/ResearchCoin/HomeAnnouncement';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <PageLayout contentWidth="narrow">
      <HomeFeedsProvider>
        <HomeTabs />
        {/* Phones; from the tablet breakpoint up it is the toast instead. */}
        <HomeAnnouncementCard className="mb-6 tablet:!hidden" />
        <HomeAnnouncementToast />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
