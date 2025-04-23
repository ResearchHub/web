'use client';

import { FC, useState } from 'react';
import { JournalFeed } from './JournalFeed';
import { JournalTabs } from './JournalTabs';
import { JournalAboutTab } from './JournalAboutTab';
import Icon from '@/components/ui/icons/Icon';
import { MainPageHeader } from '@/components/ui/MainPageHeader';

type JournalTab = 'all' | 'in-review' | 'published' | 'about';

export const JournalPage: FC = () => {
  const [activeTab, setActiveTab] = useState<JournalTab>('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: JournalTab) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

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
