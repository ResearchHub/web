'use client';

import { FC, useState } from 'react';
import { Icon } from '@/components/ui/icons/Icon';
import { JournalFeed } from './JournalFeed';
import { JournalTabs } from './JournalTabs';
import { JournalAboutTab } from './JournalAboutTab';

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
    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
      <Icon name="rhJournal2" size={24} className="text-indigo-500" />
      ResearchHub Journal
    </h1>
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
      <div className="pt-2 pb-4">
        {header}
        {description}
      </div>

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
