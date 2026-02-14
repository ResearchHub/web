'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { 
  GrantFilter, 
  FundraiseGrid, 
  FundraiseGridHeader,
  FundingActivityFeed 
} from '@/components/Fund/explore';
import {
  mockGrants,
  mockFundraises,
  getActivitiesByGrantId,
  getFundraisesByGrantId,
} from '@/mocks/fundingExploreMocks';

export default function FundingExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get selected grant from URL
  const grantIdParam = searchParams.get('grant');
  const selectedGrantId = grantIdParam ? parseInt(grantIdParam, 10) : null;

  // Update URL when grant selection changes
  const handleGrantSelect = (grantId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (grantId === null) {
      params.delete('grant');
    } else {
      params.set('grant', grantId.toString());
    }
    router.push(`/fund/explore?${params.toString()}`, { scroll: false });
  };

  // Compute fundraise counts per grant
  const fundraiseCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    mockGrants.forEach((grant) => {
      counts[grant.id] = mockFundraises.filter((f) => f.grantId === grant.id).length;
    });
    return counts;
  }, []);

  // Compute grant titles map
  const grantTitles = useMemo(() => {
    const titles: Record<number, string> = {};
    mockGrants.forEach((grant) => {
      titles[grant.id] = grant.title;
    });
    return titles;
  }, []);

  // Get filtered data based on selection
  const filteredFundraises = useMemo(
    () => getFundraisesByGrantId(selectedGrantId),
    [selectedGrantId]
  );

  const filteredActivities = useMemo(
    () => getActivitiesByGrantId(selectedGrantId),
    [selectedGrantId]
  );

  // Get selected grant title for display
  const selectedGrant = selectedGrantId 
    ? mockGrants.find((g) => g.id === selectedGrantId) 
    : null;

  // Right sidebar content
  const rightSidebarContent = (
    <FundingActivityFeed
      activities={filteredActivities}
      selectedGrantTitle={selectedGrant?.title}
      maxItems={12}
    />
  );

  return (
    <PageLayout rightSidebar={rightSidebarContent}>
      {/* Page Header */}
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title="Explore Funding"
        subtitle="Browse proposals within funding opportunities and discover research worth supporting"
        showTitle={true}
      />

      {/* Funding Opportunities Filter */}
      <div className="mt-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Funding Opportunities
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
            {mockGrants.length} Open
          </span>
        </div>
        <GrantFilter
          grants={mockGrants}
          selectedGrantId={selectedGrantId}
          onSelectGrant={handleGrantSelect}
          fundraiseCounts={fundraiseCounts}
          totalFundraiseCount={mockFundraises.length}
        />
      </div>

      {/* Fundraise Grid Header */}
      <FundraiseGridHeader
        count={filteredFundraises.length}
        selectedGrantTitle={selectedGrant?.title}
      />

      {/* Fundraise Grid */}
      <FundraiseGrid
        fundraises={filteredFundraises}
        grantTitles={grantTitles}
        showGrantBadge={selectedGrantId === null}
        isLoading={false}
      />
    </PageLayout>
  );
}
