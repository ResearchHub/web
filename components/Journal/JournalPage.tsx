'use client';

import { FC, useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { JournalFeed } from './JournalFeed';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { useFeedTabs } from '@/hooks/useFeedTabs';

const DEFAULT_TAB = 'all';

export const JournalPage: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { activeTab } = useFeedTabs();

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
      {activeTab === 'about' ? <JournalAboutTab /> : <JournalFeed activeTab={activeTab as any} />}
    </div>
  );
};
