'use client'

import { useState } from 'react';
import { FeedItem as FeedItemComponent } from './FeedItem';
import { FeedTabs } from './FeedTabs';
import { InterestSelector } from './InterestSelector/InterestSelector';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedEntry } from '@/types/feed';
import { feedEntries } from '@/store/feedData';

const ResearchFeed: React.FC = () => {
  const [showInterests, setShowInterests] = useState(false);
  const [activeInterestTab, setActiveInterestTab] = useState<'journal' | 'person' | 'topic'>('journal');
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'popular' | 'latest'>('for-you');

  const getFeedContent = (): FeedEntry[] => {
    switch (activeTab) {
      case 'for-you':
        return feedEntries; // Original order
      case 'following':
        return [...feedEntries].sort((a, b) => a.actor.fullName.localeCompare(b.actor.fullName));
      case 'popular':
        return [...feedEntries].sort((a, b) => 
          (b.item.metrics.votes + b.item.metrics.comments) - 
          (a.item.metrics.votes + a.item.metrics.comments)
        );
      case 'latest':
        return [...feedEntries].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      default:
        return feedEntries;
    }
  };

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
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {showInterests ? (
        <InterestSelector
          mode="preferences"
          activeTab={activeInterestTab}
          onComplete={handleInterestSelection}
        />
      ) : (
        <div className="space-y-4">
          {getFeedContent().map((entry: FeedEntry) => (
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