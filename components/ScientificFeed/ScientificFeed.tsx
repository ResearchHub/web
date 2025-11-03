'use client';

import { useState, useRef } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { cn } from '@/utils/styles';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  ChevronDown,
  TrendingUp,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { mockFeedData, followingTopics, FeedCard } from '@/data/mockFeedData';
import { PaperCard } from './PaperCard';
import { BountyCard } from './BountyCard';
import { ProposalCard } from './ProposalCard';
import { RFPCard } from './RFPCard';

type FeedView = 'trending' | 'for-you' | 'following';
type SortOption = 'trending' | 'latest';

export function ScientificFeed() {
  const [activeTab, setActiveTab] = useState<FeedView>('trending');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const topicsScrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    {
      id: 'trending',
      label: 'Trending',
      icon: TrendingUp,
    },
    {
      id: 'for-you',
      label: 'For You',
      icon: Sparkles,
    },
    {
      id: 'following',
      label: 'Following',
      icon: Users,
    },
  ];

  const scrollTopics = (direction: 'left' | 'right') => {
    if (topicsScrollRef.current) {
      const scrollAmount = 200;
      topicsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getSortedFeedData = (): FeedCard[] => {
    let data = [...mockFeedData];

    if (sortBy === 'trending') {
      data.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    } else if (sortBy === 'latest') {
      // Sort by date (assuming dates are formatted consistently)
      data.sort((a, b) => {
        const dateA = new Date(a.createdDate);
        const dateB = new Date(b.createdDate);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return data;
  };

  const renderCard = (item: FeedCard) => {
    switch (item.type) {
      case 'paper':
        return <PaperCard key={item.id} paper={item} />;
      case 'bounty':
        return <BountyCard key={item.id} bounty={item} />;
      case 'proposal':
        return <ProposalCard key={item.id} proposal={item} />;
      case 'rfp':
        return <RFPCard key={item.id} rfp={item} />;
      default:
        return null;
    }
  };

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'latest', label: 'Latest', icon: Clock },
  ];

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Trending';
  const currentSortIcon = sortOptions.find((opt) => opt.value === sortBy)?.icon || TrendingUp;
  const CurrentIcon = currentSortIcon;

  return (
    <div className="w-full">
      {/* Tabs with Sort Dropdown */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as FeedView)}
            />
          </div>
          <div className="flex-shrink-0 mb-2">
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <CurrentIcon className="w-4 h-4" />
                  {currentSortLabel}
                  <ChevronDown className="w-4 h-4" />
                </button>
              }
              anchor="bottom end"
              className="w-40"
            >
              {sortOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <DropdownItem
                    key={option.value}
                    onClick={() => setSortBy(option.value as SortOption)}
                    className={cn(
                      'flex items-center gap-2',
                      sortBy === option.value && 'bg-gray-100 font-medium'
                    )}
                  >
                    <OptionIcon className="w-4 h-4" />
                    {option.label}
                  </DropdownItem>
                );
              })}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Following Topics */}
      {activeTab === 'following' && (
        <div className="mb-6">
          <div className="relative group">
            {/* Left scroll button */}
            <button
              onClick={() => scrollTopics('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* Topics scroll container */}
            <div
              ref={topicsScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                onClick={() => setSelectedTopic('All')}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedTopic === 'All'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All
              </button>
              {followingTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    selectedTopic === topic
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Right scroll button */}
            <button
              onClick={() => scrollTopics('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Feed Cards */}
      <div className="space-y-4">{getSortedFeedData().map((item) => renderCard(item))}</div>
    </div>
  );
}
