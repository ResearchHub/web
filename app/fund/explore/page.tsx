'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { formatDeadline } from '@/utils/date';
import {
  GrantFilter,
  FundraiseGrid,
  FundraiseGridHeader,
  FundingActivityFeed,
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
      if (typeof grant.id === 'number') {
        counts[grant.id] = mockFundraises.filter((f) => f.grantId === grant.id).length;
      }
    });
    return counts;
  }, []);

  // Compute grant titles map
  const grantTitles = useMemo(() => {
    const titles: Record<number, string> = {};
    mockGrants.forEach((grant) => {
      if (typeof grant.id === 'number') {
        titles[grant.id] = grant.title;
      }
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
  const selectedGrant = selectedGrantId ? mockGrants.find((g) => g.id === selectedGrantId) : null;

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
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Funding Opportunities</h2>
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

      {/* Selected Grant Details */}
      {selectedGrant && (
        <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{selectedGrant.organization}</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedGrant.title}</h3>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  {selectedGrant.description}
                </p>
              </div>

              <div className="flex items-center text-sm text-gray-500 pt-2">
                <span className="text-green-600 font-medium">{selectedGrant.amount.formatted}</span>

                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-3" />

                <span>
                  Status:{' '}
                  <span className="text-gray-900 font-medium capitalize">
                    {selectedGrant.status.toLowerCase()}
                  </span>
                </span>

                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-3" />

                <span className="text-gray-900 font-medium">
                  {formatDeadline(selectedGrant.endDate)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[200px]">
              <Link
                href={`/fund/new?grant=${selectedGrant.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all hover:shadow-md group/btn w-full "
              >
                <span className="font-semibold text-lg">Apply Now</span>
                <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <p className="text-sm text-gray-600 text-center w-full">Submit a proposal</p>
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
