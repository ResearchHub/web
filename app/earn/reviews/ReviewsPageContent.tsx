'use client';

import { X } from 'lucide-react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { BountyHubSelector as HubsSelector } from '@/components/Earn/BountyHubSelector';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { Badge } from '@/components/ui/Badge';
import { useBounties } from '@/hooks/useBounties';
import { EarnSectionCards } from '@/components/Funding/EarnSectionCards';

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

  const sortOptions = [
    { label: 'Best', value: 'personalized' },
    { label: 'Newest', value: '-created_date' },
    { label: 'Expiring soon', value: 'expiration_date' },
    { label: 'RSC amount', value: '-total_amount' },
  ];

  const filters = (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
        <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={handleHubsChange}
            displayCountOnly
            hideSelectedItems={true}
          />
        </div>
        <div className="w-1/2 sm:!w-[120px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => handleSortChange(opt.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {selectedHubs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedHubs.map((hub) => (
            <Badge
              key={hub.id}
              variant="default"
              className="flex items-center gap-1 pr-1 bg-gray-50"
            >
              <span>Topic: {hub.name}</span>
              <button
                type="button"
                onClick={() => handleHubsChange(selectedHubs.filter((h) => h.id !== hub.id))}
                className="text-gray-500 hover:text-gray-700 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const header = (
    <div>
      <MainPageHeader
        icon={<Icon name="earn1" size={26} color="#3971ff" />}
        title="Earn ResearchCoin"
        subtitle="Earn ResearchCoin by completing scientific bounties"
        showTitle={false}
      />
      <EarnSectionCards />
    </div>
  );

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      header={header}
      filters={filters}
      showBountyFooter={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      showBountyInfo={true}
    />
  );
}
