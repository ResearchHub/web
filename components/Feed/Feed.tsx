'use client'

import { FC, useState } from 'react';
import { feedEntries } from '@/store/feedStore';
import { FeedTabs } from '../FeedTabs';
import { InterestSelector } from '../InterestSelector/InterestSelector';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FeedItem } from './FeedItem';
import toast from 'react-hot-toast';

export const Feed: FC = () => {
  const [showInterests, setShowInterests] = useState(false);
  const [activeInterestTab, setActiveInterestTab] = useState<'journal' | 'person' | 'topic'>('journal');
  const [activeTab, setActiveTab] = useState<'for-you' | 'following' | 'popular' | 'latest'>('for-you');

  const getFeedContent = () => {
    switch (activeTab) {
      case 'for-you':
        return feedEntries; // Original order
      case 'following':
        return [...feedEntries].sort((a, b) => a.actor.fullName.localeCompare(b.actor.fullName));
      case 'popular':
        return [...feedEntries].sort((a, b) => 
          (b.metrics.votes + b.metrics.comments) - 
          (a.metrics.votes + a.metrics.comments)
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
    toast.success('Your preferences have been updated', {
      duration: 4000,
      position: 'bottom-right',
      style: {
        background: '#F9FAFB',
        color: '#111827',
        border: '1px solid #E5E7EB',
      },
    });
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
        <div className="max-w-2xl mx-auto">
          {getFeedContent().map((entry) => (
            <FeedItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Feed; 