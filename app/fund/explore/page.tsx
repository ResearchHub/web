'use client';

import { useState, useMemo } from 'react';
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
  mockFundingActivities,
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

      {/* Grant Filter (Funding Opportunities) */}
      <div className="mt-6 mb-8">
        <GrantFilter
          grants={mockGrants}
          selectedGrantId={selectedGrantId}
          onSelectGrant={handleGrantSelect}
          fundraiseCounts={fundraiseCounts}
          totalFundraiseCount={mockFundraises.length}
        />
      </div>

      {/* Selected Grant Info Banner (when a specific grant is selected) */}
      {selectedGrant && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedGrant.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {selectedGrant.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-gray-700">
                    {selectedGrant.organization}
                  </span>
                </span>
                <span>•</span>
                <span className="font-medium text-emerald-600">
                  {selectedGrant.amount.formatted} available
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
