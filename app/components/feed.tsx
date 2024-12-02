'use client'

import { useState } from 'react';
import { FeedItem as FeedItemComponent } from './FeedItem';
import { FeedTabs } from './FeedTabs';
import { InterestSelector } from './InterestSelector/InterestSelector';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedEntry } from '@/types/feed';
import { feedEntries } from '@/store/feedData';

const ResearchFeed: React.FC = () => {
  const [publishOpen, setPublishOpen] = useState(false);
  const [showInterests, setShowInterests] = useState(false);
  const [activeInterestTab, setActiveInterestTab] = useState<'journal' | 'person' | 'topic'>('journal');

  const handleInterestSelection = async (interests: any[]) => {
    setShowInterests(false);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today in Science</h1>
        <p className="text-gray-600 mt-1">Discover the latest research, grants, earning, and funding opportunities</p>
      </div>

      <FeedTabs 
        showingInterests={showInterests} 
        onInterestsClick={() => setShowInterests(!showInterests)}
        activeInterestTab={activeInterestTab}
        onInterestTabChange={setActiveInterestTab}
      />

      {showInterests ? (
        <InterestSelector
          mode="preferences"
          activeTab={activeInterestTab}
          onComplete={handleInterestSelection}
        />
      ) : (
        <div className="space-y-4">
          {feedEntries?.map((entry: FeedEntry, index) => (
            entry && (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <FeedItemComponent entry={entry} />
              </div>
            )
          ))}
        </div>
      )}
    </PageLayout>
  );
}

export default ResearchFeed;