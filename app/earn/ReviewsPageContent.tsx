'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import { FeedContent } from '@/components/Feed/FeedContent';
import { PillTabs, PillTab } from '@/components/ui/PillTabs';
import { useBounties } from '@/hooks/useBounties';
import { BountyService } from '@/services/bounty.service';
import { Topic } from '@/types/topic';

const ALL_TOPICS_ID = '__all__';

const SORT_OPTIONS = [
  { label: 'Best', value: 'personalized' },
  { label: 'Newest', value: '-created_date' },
  { label: 'Expiring soon', value: 'expiration_date' },
  { label: 'RSC amount', value: '-total_amount' },
];

function BountySortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = SORT_OPTIONS.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className="font-medium text-gray-700">{selectedLabel}</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {SORT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  value === option.value ? 'border-primary-500' : 'border-gray-300'
                )}
              >
                {value === option.value && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </span>
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </span>
  );
}

export function ReviewsPageContent() {
  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    handleSortChange,
    selectedHubs,
    handleHubsChange,
    restoredScrollPosition,
    page,
    lastClickedEntryId,
  } = useBounties();

  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  useEffect(() => {
    (async () => {
      const topics = await BountyService.getBountyHubs();
      setAllTopics(topics);
    })();
  }, []);

  const activeTabId = selectedHubs.length === 1 ? String(selectedHubs[0].id) : ALL_TOPICS_ID;

  const tabs: PillTab[] = useMemo(() => {
    const topicTabs: PillTab[] = allTopics.map((t) => ({
      id: String(t.id),
      label: t.name,
    }));
    return [{ id: ALL_TOPICS_ID, label: 'All' }, ...topicTabs];
  }, [allTopics]);

  const handleTabChange = (tabId: string) => {
    if (tabId === ALL_TOPICS_ID) {
      handleHubsChange([]);
    } else {
      const topic = allTopics.find((t) => String(t.id) === tabId);
      if (topic) {
        handleHubsChange([{ id: topic.id, name: topic.name, description: topic.description }]);
      }
    }
  };

  const filters = (
    <div className="mt-5 relative flex items-center">
      <div className="min-w-0 flex-1 pr-24">
        <PillTabs
          tabs={tabs}
          activeTab={activeTabId}
          onTabChange={handleTabChange}
          size="sm"
          scrollCacheKey="earn-topics"
          chevronClassName="text-gray-900 hover:text-black"
        />
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-6"
        style={{ background: 'linear-gradient(to right, transparent, white 30%)' }}
      >
        <BountySortDropdown value={sort} onChange={handleSortChange} />
      </div>
    </div>
  );

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      filters={filters}
      showBountyFooter={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      showBountyInfo={true}
      abstractCollapsedByDefault={true}
    />
  );
}
