'use client';

import { FC, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { JournalFeed } from './JournalFeed';
import { JournalTabs } from './JournalTabs';

type JournalTab = 'all' | 'in-review' | 'published';

export const JournalPage: FC = () => {
  const [activeTab, setActiveTab] = useState<JournalTab>('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: JournalTab) => {
    setIsLoading(true);
    setActiveTab(tab);
    // Simulate loading
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
  ];

  const header = (
    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
      <Sparkles className="w-6 h-6 text-indigo-500" />
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

      <JournalFeed activeTab={activeTab} isLoading={isLoading} tabs={journalTabs} />
    </div>
  );
};
