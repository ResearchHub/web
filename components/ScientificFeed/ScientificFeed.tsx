'use client';

import { useState, useRef } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { cn } from '@/utils/styles';
import { ChevronLeft, ChevronRight, ChevronDown, Star, Clock, Settings } from 'lucide-react';
import { mockFeedData, followingTopics, FeedCard } from '@/data/mockFeedData';
import { PaperCard } from './PaperCard';
import { BountyCard } from './BountyCard';
import { ProposalCard } from './ProposalCard';
import { RFPCard } from './RFPCard';
import { TopicPreferencesModal } from './TopicPreferencesModal';

type FeedView = 'trending' | 'for-you' | 'following';
type SortOption = 'trending' | 'latest';

export function ScientificFeed() {
  // Feature flags
  const showHeroImages = true;
  const showCategoryAboveTitle = true; // When false, shows trending score in action bar instead of top
  const categoryBadgeStyle: 'badge' | 'text' = 'badge'; // 'badge' or 'text'
  const imageLayout: 'above-title' | 'right-column' | 'below-title' = 'right-column';
  const showUpvoteButton = true; // Set to true to show upvote/downvote buttons
  const showTrendingScoreInActionBar = false; // If true, shows trending score to the right of Save instead of upvotes
  const useAlphaDesign = false; // Feature flag for alpha design variations
  const useBetaDesign = true; // Feature flag for beta design variations

  const [activeTab, setActiveTab] = useState<FeedView>('for-you');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [followed, setFollowed] = useState<string[]>(followingTopics);
  const topicsScrollRef = useRef<HTMLDivElement>(null);

  const tabs = [
    {
      id: 'for-you',
      label: 'For You',
    },
    {
      id: 'following',
      label: 'Following',
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

  const handleToggleTopic = (topic: string) => {
    setFollowed((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
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

    // Secondary sort: ensure all papers render first
    data.sort((a, b) => {
      if (a.type === 'paper' && b.type !== 'paper') return -1;
      if (a.type !== 'paper' && b.type === 'paper') return 1;
      return 0;
    });

    return data;
  };

  const renderCard = (item: FeedCard) => {
    switch (item.type) {
      case 'paper':
        return (
          <PaperCard
            key={item.id}
            paper={item}
            showHeroImage={showHeroImages}
            showCategoryAboveTitle={showCategoryAboveTitle}
            categoryBadgeStyle={categoryBadgeStyle}
            imageLayout={imageLayout}
            showUpvoteButton={showUpvoteButton}
            showTrendingScoreInActionBar={showTrendingScoreInActionBar}
            useAlphaDesign={useAlphaDesign}
            useBetaDesign={useBetaDesign}
          />
        );
      case 'bounty':
        return (
          <BountyCard
            key={item.id}
            bounty={item}
            useAlphaDesign={useAlphaDesign}
            useBetaDesign={useBetaDesign}
          />
        );
      case 'proposal':
        return (
          <ProposalCard
            key={item.id}
            proposal={item}
            useAlphaDesign={useAlphaDesign}
            useBetaDesign={useBetaDesign}
          />
        );
      case 'rfp':
        return (
          <RFPCard
            key={item.id}
            rfp={item}
            useAlphaDesign={useAlphaDesign}
            useBetaDesign={useBetaDesign}
          />
        );
      default:
        return null;
    }
  };

  const sortOptions = [
    { value: 'trending', label: 'Best', icon: Star },
    { value: 'latest', label: 'Latest', icon: Clock },
  ];

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || 'Best';
  const currentSortIcon = sortOptions.find((opt) => opt.value === sortBy)?.icon || Star;
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
          {activeTab === 'following' && (
            <div className="flex-shrink-0 mb-0">
              <Dropdown
                trigger={
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <CurrentIcon className="w-3.5 h-3.5" />
                    {currentSortLabel}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                }
                anchor="bottom end"
                className="w-32"
              >
                {sortOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <DropdownItem
                      key={option.value}
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        sortBy === option.value && 'bg-gray-100 font-medium'
                      )}
                    >
                      <OptionIcon className="w-3.5 h-3.5" />
                      {option.label}
                    </DropdownItem>
                  );
                })}
              </Dropdown>
            </div>
          )}
        </div>
      </div>

      {/* Following Topics */}
      {activeTab === 'following' && (
        <div className="mb-6 max-w-[700px] mx-auto overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="relative group flex-1">
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
                    'flex-shrink-0 px-4 py-1 rounded-md text-sm font-medium transition-colors',
                    selectedTopic === 'All'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  All
                </button>
                {followed.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={cn(
                      'flex-shrink-0 px-3 py-0 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
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

            {/* Settings/Gear Button */}
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="flex-shrink-0 p-1.5 mt-[-8px] rounded-full  border-gray-300 bg-white hover:bg-gray-50 hover:border-primary-500 transition-all shadow-sm group"
              aria-label="Topic preferences"
              title="Manage topics"
            >
              <Settings className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* Feed Cards */}
      <div className="space-y-6">{getSortedFeedData().map((item) => renderCard(item))}</div>

      {/* Topic Preferences Modal */}
      <TopicPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        followedTopics={followed}
        onToggleTopic={handleToggleTopic}
      />
    </div>
  );
}
