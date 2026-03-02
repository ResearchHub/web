'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { PageLayout } from '../layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { EarnRightSidebar } from '@/components/Earn/EarnRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { BountyHubSelector as HubsSelector } from '@/components/Earn/BountyHubSelector';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { Badge } from '@/components/ui/Badge';
import { useBounties } from '@/hooks/useBounties';
import { useGrants } from '@/contexts/GrantContext';
import { GrantCard } from '@/components/Funding/GrantCard';
import { FeedGrantContent } from '@/types/feed';
import { cn } from '@/utils/styles';

type EarnTab = 'awards' | 'reviews';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd)}`;
}

function EarnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') as EarnTab) || 'awards';

  const { grants, fetchGrants, totalFundingUsd } = useGrants();

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const openGrants = useMemo(
    () =>
      grants.filter((g) => {
        const content = g.content as FeedGrantContent;
        return content.grant.status !== 'CLOSED';
      }),
    [grants]
  );

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
    total: bountyTotal,
    lastClickedEntryId,
  } = useBounties();

  const setTab = (tab: EarnTab) => {
    if (tab === 'awards') {
      router.replace('/earn', { scroll: false });
    } else {
      router.replace('/earn?tab=reviews', { scroll: false });
    }
  };

  const sortOptions = [
    { label: 'Best', value: 'personalized' },
    { label: 'Newest', value: '-created_date' },
    { label: 'Expiring soon', value: 'expiration_date' },
    { label: 'RSC amount', value: '-total_amount' },
  ];

  const renderFilters = () => (
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

  const sectionCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-4">
      <button
        onClick={() => setTab('awards')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'awards'
            ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <h3 className="text-[15px] font-semibold text-gray-900">Awards</h3>
          </div>
          {openGrants.length > 0 && (
            <span className="text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-0.5">
              {openGrants.length} open
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">
          Submit proposals to compete for pooled community funding
        </p>
        {totalFundingUsd > 0 && (
          <p className="text-lg font-bold font-mono text-gray-900">
            {formatCompactAmount(totalFundingUsd)}
            <span className="text-xs font-normal text-gray-400 font-sans ml-1">pooled</span>
          </p>
        )}
      </button>

      <button
        onClick={() => setTab('reviews')}
        className={cn(
          'rounded-xl border p-4 text-left transition-all',
          activeTab === 'reviews'
            ? 'border-amber-300 bg-amber-50/40 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <h3 className="text-[15px] font-semibold text-gray-900">Peer Reviews</h3>
          </div>
          {bountyTotal > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
              {bountyTotal} available
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">Review papers in your area of expertise</p>
        <p className="text-lg font-bold font-mono text-gray-900">
          $150+
          <span className="text-xs font-normal text-gray-400 font-sans ml-1">per review</span>
        </p>
      </button>
    </div>
  );

  if (activeTab === 'awards') {
    return (
      <>
        <div className="-mb-2">
          <MainPageHeader
            icon={<Icon name="earn1" size={26} color="#3971ff" />}
            title="Earn ResearchCoin"
            subtitle="Earn ResearchCoin by completing scientific bounties"
            showTitle={false}
          />
        </div>
        {sectionCards}

        {openGrants.length > 0 ? (
          <div className="flex flex-col gap-3 mt-2">
            {openGrants.map((entry) => (
              <GrantCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-gray-400 text-sm">No open awards right now</p>
        )}
      </>
    );
  }

  const header = (
    <div className="-mb-8">
      <MainPageHeader
        icon={<Icon name="earn1" size={26} color="#3971ff" />}
        title="Earn ResearchCoin"
        subtitle="Earn ResearchCoin by completing scientific bounties"
        showTitle={false}
      />
      {sectionCards}
    </div>
  );

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      header={header}
      filters={renderFilters()}
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

export default function EarnPage() {
  return (
    <PageLayout rightSidebar={<EarnRightSidebar />}>
      <EarnPageContent />
    </PageLayout>
  );
}
