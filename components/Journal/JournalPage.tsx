'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { JournalFeed } from './JournalFeed';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';

const DEFAULT_TAB = 'all';

export const JournalPage: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    tabs: feedTabsList,
    activeTab,
    handleTabChange,
  } = useFeedTabs(() => setIsNavigating(true));

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', DEFAULT_TAB);
      window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
    }
  }, [pathname, searchParams]);

  const header = (
    <MainPageHeader
      icon={<Icon name="rhJournal2" size={26} color="#3971ff" />}
      title="ResearchHub Journal"
      subtitle="Accelerating science through open access publishing and peer review."
      showTitle={false}
    />
  );

  return (
    <div className="space-y-1">
      {header}

      <div className="mb-6 border-b">
        <FeedTabs
          activeTab={activeTab as any}
          tabs={feedTabsList}
          onTabChange={handleTabChange}
          isLoading={isNavigating}
        />
      </div>

      {activeTab === 'about' ? <JournalAboutTab /> : <JournalFeed activeTab={activeTab as any} />}
    </div>
  );
};
