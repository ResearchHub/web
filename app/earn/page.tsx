'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BountyService } from '@/services/bounty.service';
import { FeedEntry } from '@/types/feed';
import { Tabs } from '@/components/ui/Tabs';
import { EarnRightSidebar } from '@/components/Earn/EarnRightSidebar';
import { Coins } from 'lucide-react';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';

export default function EarnPage() {
  const [bounties, setBounties] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const fetchBounties = async (reset = false) => {
    setIsLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const status = activeTab === 'all' ? 'OPEN' : activeTab.toUpperCase();

      const result = await BountyService.fetchBounties({
        status,
        personalized: true,
        sort: '-created_date',
        onlyParentBounties: true,
        page: currentPage,
        pageSize: 10,
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    fetchBounties(true);
  };

  const loadMore = () => {
    fetchBounties();
  };

  useEffect(() => {
    fetchBounties(true);
  }, []);

  const tabs = [
    {
      id: 'all',
      label: 'All Bounties',
    },
    {
      id: 'review',
      label: 'Peer-Review Bounties',
    },
    {
      id: 'answer',
      label: 'Answer Bounties',
    },
  ];

  const renderTabs = () => (
    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} disabled={isLoading} />
  );

  const renderHeader = () => (
    <MainPageHeader
      icon={<Icon name="earn1" size={26} color="#4f46e5" />}
      title="Earn ResearchCoin"
      subtitle="Earn ResearchCoin by completing scientific bounties"
    />
  );

  return (
    <PageLayout rightSidebar={<EarnRightSidebar />}>
      <FeedContent
        entries={bounties}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        header={renderHeader()}
        tabs={renderTabs()}
        activeTab={activeTab as any}
      />
    </PageLayout>
  );
}
