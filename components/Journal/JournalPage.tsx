'use client';

import { FC, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { JournalFeed } from './JournalFeed';
import { JournalTabs, TabType } from './JournalTabs';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';

const DEFAULT_TAB: TabType = 'all';

export const JournalPage: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab') as TabType | null;
    return tabParam && ['all', 'in-review', 'published', 'about'].includes(tabParam)
      ? tabParam
      : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return; // Skip if tab is already active
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    // Simulate loading state when tab changes via URL
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300); // Shorter delay for URL changes
    return () => clearTimeout(timer);
  }, [activeTab]);

  const tabs = [
    {
      id: 'all',
      label: 'All',
    },
    {
      id: 'in-review',
      label: 'In Review',
    },
    {
      id: 'published',
      label: 'Published',
    },
    {
      id: 'about',
      label: 'About',
    },
  ];

  const header = (
    <MainPageHeader
      icon={<Icon name="rhJournal2" size={26} color="#3971ff" />}
      title="ResearchHub Journal"
      subtitle="Accelerating science through open access publishing and peer review."
    />
  );

  return (
    <div className="space-y-1">
      {header}

      <JournalTabs
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={handleTabChange}
        isLoading={isLoading}
      />

      {activeTab === 'about' ? (
        <JournalAboutTab />
      ) : (
        <JournalFeed activeTab={activeTab} isLoading={isLoading} />
      )}
    </div>
  );
};
