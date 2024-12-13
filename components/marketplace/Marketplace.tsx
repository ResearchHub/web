'use client'

import { useState } from 'react';
import { Plus, Store, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MarketplaceTabs } from './MarketplaceTabs';
import { MarketplaceSort } from './MarketplaceSort';
import { MarketplaceFundingBanner } from './MarketplaceFundingBanner';
import { MarketplaceRewardsBanner } from './MarketplaceRewardsBanner';
import { FeedItem } from '../FeedItem';
import { feedEntries } from '@/store/feedStore';
import { FeedEntry } from '@/types/feed';
import toast from 'react-hot-toast';
import { Button } from '@/Button';

export const Marketplace = () => {
  const [activeTab, setActiveTab] = useState<'fund' | 'rewards' | 'grants'>('fund');
  const [showFundingBanner, setShowFundingBanner] = useState(true);
  const [showRewardsBanner, setShowRewardsBanner] = useState(true);
  const [isRequestFundingOpen, setIsRequestFundingOpen] = useState(false);
  const [isCreateGrantOpen, setIsCreateGrantOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState({ id: 'newest', name: 'Newest' });

  // Filter entries based on active tab and only get marketplace posts
  const getMarketplaceItems = (): FeedEntry[] => {
    const marketplaceEntries = feedEntries.filter(entry => 
      entry.action === 'post' && entry.id.startsWith('marketplace-')
    );

    switch (activeTab) {
      case 'fund':
        return marketplaceEntries.filter(entry => entry.item.type === 'funding_request');
      case 'rewards':
        return marketplaceEntries.filter(entry => entry.item.type === 'reward');
      case 'grants':
        return marketplaceEntries.filter(entry => entry.item.type === 'grant');
      default:
        return [];
    }
  };

  const getSortedItems = (items: FeedEntry[]) => {
    switch (selectedSort.id) {
      case 'amount':
        return [...items].sort((a, b) => {
          const aAmount = typeof a.item.amount === 'string' ? parseInt(a.item.amount.replace(/,/g, '')) : a.item.amount;
          const bAmount = typeof b.item.amount === 'string' ? parseInt(b.item.amount.replace(/,/g, '')) : b.item.amount;
          return bAmount - aAmount;
        });
      case 'progress':
        return [...items].sort((a, b) => {
          if ('progress' in a.item && 'progress' in b.item) {
            return b.item.progress - a.item.progress;
          }
          return 0;
        });
      case 'deadline':
        return [...items].sort((a, b) => {
          if ('deadline' in a.item && 'deadline' in b.item) {
            return parseInt(a.item.deadline) - parseInt(b.item.deadline);
          }
          return 0;
        });
      case 'popular':
        return [...items].sort((a, b) => b.item.metrics.votes - a.item.metrics.votes);
      case 'applicants':
        return [...items].sort((a, b) => 
          (b.item.metrics.applicants || 0) - (a.item.metrics.applicants || 0)
        );
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
        return [...items].sort((a, b) => {
          if ('difficulty' in a.item && 'difficulty' in b.item) {
            return difficultyOrder[b.item.difficulty] - difficultyOrder[a.item.difficulty];
          }
          return 0;
        });
      case 'newest':
      default:
        return items;
    }
  };

  const getActionButton = () => {
    const handleButtonClick = () => {
      toast((t) => (
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Implementation coming soon</span>
        </div>
      ), {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#FFF7ED', // Orange-50
          color: '#EA580C',     // Orange-600
          border: '1px solid #FDBA74', // Orange-300
        },
      });
    };

    switch (activeTab) {
      case 'fund':
        return (
          <Button onClick={handleButtonClick}>
            <Plus className="h-4 w-4 mr-2" /> Request Funding
          </Button>
        );
      case 'rewards':
        return (
          <Button onClick={handleButtonClick}>
            <Plus className="h-4 w-4 mr-2" /> Create Reward
          </Button>
        );
      case 'grants':
        return (
          <Button onClick={handleButtonClick}>
            <Plus className="h-4 w-4 mr-2" /> Create Grant
          </Button>
        );
    }
  };

  const items = getSortedItems(getMarketplaceItems());

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="h-7 w-7 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">ResearchCoin Marketplace</h1>
          </div>
          {getActionButton()}
        </div>
        <p className="text-gray-600 mt-1">Fund science, apply for grants, or earn RSC through contributions</p>
      </div>

      <MarketplaceTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {showFundingBanner && activeTab === 'fund' && (
        <div className="mt-6">
          <MarketplaceFundingBanner onDismiss={() => setShowFundingBanner(false)} />
        </div>
      )}

      {showRewardsBanner && activeTab === 'rewards' && (
        <div className="mt-6">
          <MarketplaceRewardsBanner onDismiss={() => setShowRewardsBanner(false)} />
        </div>
      )}

      <div className="flex justify-end mt-4 mb-6">
        <MarketplaceSort
          activeTab={activeTab}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </div>

      <div className="space-y-4">
        {items.map((entry) => (
          <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <FeedItem entry={entry} />
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Marketplace; 