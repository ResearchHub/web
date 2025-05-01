'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BountyService } from '@/services/bounty.service';
import { FeedEntry } from '@/types/feed';
import { EarnRightSidebar } from '@/components/Earn/EarnRightSidebar';
import { Coins } from 'lucide-react';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { HubsSelector, Hub } from '@/app/paper/create/components/HubsSelector';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

export default function EarnPage() {
  const [bounties, setBounties] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);
  const [sort, setSort] = useState<string>('personalized');

  // Available sort options
  const sortOptions = [
    { label: 'Best', value: 'personalized' },
    { label: 'Newest', value: '-created_date' },
    { label: 'Expiring soon', value: 'expiration_date' },
    { label: 'RSC amount', value: '-total_amount' },
  ];

  const fetchBounties = async (reset = false, hubs: Hub[] = selectedHubs) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const status = 'OPEN';

      const result = await BountyService.fetchBounties({
        status,
        personalized: true,
        sort,
        onlyParentBounties: true,
        page: currentPage,
        pageSize: 10,
        hubIds: hubs.map((h) => h.id),
      });

      if (reset) {
        setBounties(result.entries);
      } else {
        setBounties((prev) => [...prev, ...result.entries]);
      }

      setHasMore(result.hasMore);
      setTotal(result.total);

      if (!reset) {
        setPage(currentPage + 1);
      } else {
        setPage(2);
      }
    } catch (error) {
      console.error('Error fetching bounties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHubsChange = (hubs: Hub[]) => {
    setSelectedHubs(hubs);
    // Reset pagination and fetch bounties based on new hubs selection
    setPage(1);
    fetchBounties(true, hubs);
  };

  const loadMore = () => {
    fetchBounties();
  };

  // Initial load
  useEffect(() => {
    fetchBounties(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when sort changes
  useEffect(() => {
    setPage(1);
    fetchBounties(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const renderFilters = () => (
    <div className="mt-4 space-y-3">
      {/* Top filter bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <HubsSelector selectedHubs={selectedHubs} onChange={handleHubsChange} displayCountOnly />
        <div className="ml-auto">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => setSort(opt.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Selected hubs badges */}
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

  const renderHeader = () => (
    <MainPageHeader
      icon={<Icon name="earn1" size={26} color="#4f46e5" />}
      title="Earn ResearchCoin"
      subtitle="Earn ResearchCoin by completing scientific bounties"
    />
  );

  const header = <div className="-mb-8">{renderHeader()}</div>;
  return (
    <PageLayout rightSidebar={<EarnRightSidebar />}>
      <FeedContent
        entries={bounties}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={header}
        filters={renderFilters()}
        showBountyFooter={false}
      />
    </PageLayout>
  );
}
