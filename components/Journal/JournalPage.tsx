'use client';

import { FC, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { JournalFeed } from './JournalFeed';
import { JournalTabs } from './JournalTabs';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';

type JournalTab = 'all' | 'in-review' | 'published' | 'about';

const DEFAULT_TAB: JournalTab = 'all';

export const JournalPage: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab') as JournalTab | null;
    return tabParam && ['all', 'in-review', 'published', 'about'].includes(tabParam)
      ? tabParam
      : DEFAULT_TAB;
  }, [searchParams]);

  const handleTabChange = (tab: JournalTab) => {
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
      label: 'All Submissions',
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
      icon={<Icon name="rhJournal2" size={26} color="#4f46e5" />}
      title="ResearchHub Journal"
      subtitle="Accelerating science through open access publishing and peer review."
    />
  );

  const description = (
    <p className="text-gray-600 mt-2 mb-6">
      Accelerating science through open access publishing and peer review.
    </p>
  );

  const journalTabs = (
    <JournalTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={handleTabChange}
      isLoading={isLoading}
    />
  );

  return (
    <div className="space-y-6">
      <div className="pt-4 pb-7">{header}</div>

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
