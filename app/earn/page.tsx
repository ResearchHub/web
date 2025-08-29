'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BountyService } from '@/services/bounty.service';
import { FeedEntry } from '@/types/feed';
import { EarnRightSidebar } from '@/components/Earn/EarnRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { HubsSelector, HubsSelected, Hub } from '@/components/Hub/HubSelector';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { useClickContext } from '@/contexts/ClickContext';

export default function EarnPage() {
  const [bounties, setBounties] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);
  const [sort, setSort] = useState<string>('personalized');

  // Click context for topic filter
  const { event, clearEvent } = useClickContext();

  // Available sort options
  const sortOptions = [
    { label: 'Best', value: 'personalized' },
    { label: 'Newest', value: '-created_date' },
    { label: 'Expiring soon', value: 'expiration_date' },
    { label: 'RSC amount', value: '-total_amount' },
  ];

  const fetchBounties = async (reset = false, hubs: Hub[] = selectedHubs) => {
    if (reset) {
      // Clear current bounties so skeleton loaders show instead of stale data
      setBounties([]);
    }
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

  // Apply clicked topic filter
  useEffect(() => {
    if (event && event.type === 'topic') {
      const topic = event.payload;
      const newHub: Hub = {
        id: topic.id,
        name: topic.name,
        description: topic.description,
      };
      setSelectedHubs([newHub]);
      setPage(1);
      fetchBounties(true, [newHub]);
      clearEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const renderFilters = () => (
    <div className="mt-5 space-y-3">
      {/* Top filter bar */}
      <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
        <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={handleHubsChange}
            displayCountOnly
            hideSelectedItems={true}
            hubType="bounty"
          />
        </div>
        <div className="w-1/2 sm:!w-[120px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => setSort(opt.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {selectedHubs.length > 0 && (
        <HubsSelected selectedHubs={selectedHubs} onChange={handleHubsChange} />
      )}
    </div>
  );

  const renderHeader = () => (
    <MainPageHeader
      icon={<Icon name="earn1" size={26} color="#3971ff" />}
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
