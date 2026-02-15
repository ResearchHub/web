'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { formatDeadline } from '@/utils/date';
import {
  GrantFilter,
  FundraiseGrid,
  FundingActivityFeed,
  OrgHeader,
} from '@/components/Fund/explore';
import {
  FUNDING_TOPICS,
  getGrantsByTopic,
  getFundraisesByTopic,
  getActivitiesByGrantId,
  getActivitiesByTopic,
  getOrganizationBySlug,
  getGrantsByOrganization,
  getFundraisesByOrganization,
  getActivitiesByOrganization,
} from '@/mocks/fundingExploreMocks';
import type { Grant } from '@/types/grant';

export default function FundingExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── URL state ──────────────────────────────────────────────────────────
  const topicParam = searchParams.get('topic') || 'all';
  const grantIdParam = searchParams.get('grant');
  const orgSlug = searchParams.get('org');

  const selectedGrantId = grantIdParam ? parseInt(grantIdParam, 10) : null;
  const isOrgMode = orgSlug !== null;

  const [orgTab, setOrgTab] = useState<'opportunities' | 'impact'>('opportunities');
  const selectedOrg = isOrgMode ? getOrganizationBySlug(orgSlug) : undefined;

  // ── Topic-based data (default browse) ──────────────────────────────────
  const topicGrants = useMemo(() => getGrantsByTopic(topicParam), [topicParam]);
  const topicFundraises = useMemo(() => getFundraisesByTopic(topicParam), [topicParam]);

  const activeFundraises = useMemo(() => {
    if (selectedGrantId !== null) {
      return topicFundraises.filter((f) => f.grantId === selectedGrantId);
    }
    return topicFundraises;
  }, [topicFundraises, selectedGrantId]);

  const activeActivities = useMemo(() => {
    if (selectedGrantId !== null) {
      return getActivitiesByGrantId(selectedGrantId);
    }
    return getActivitiesByTopic(topicParam);
  }, [topicParam, selectedGrantId]);

  const fundraiseCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    topicGrants.forEach((grant) => {
      if (typeof grant.id === 'number') {
        counts[grant.id] = topicFundraises.filter((f) => f.grantId === grant.id).length;
      }
    });
    return counts;
  }, [topicGrants, topicFundraises]);

  const grantTitles = useMemo(() => {
    const titles: Record<number, string> = {};
    topicGrants.forEach((grant) => {
      if (typeof grant.id === 'number') {
        titles[grant.id] = grant.title;
      }
    });
    return titles;
  }, [topicGrants]);

  const selectedGrant = selectedGrantId
    ? topicGrants.find((g) => g.id === selectedGrantId) ?? null
    : null;

  // ── Org-scoped data ────────────────────────────────────────────────────
  const orgGrants = useMemo(
    () => (isOrgMode ? getGrantsByOrganization(orgSlug) : []),
    [isOrgMode, orgSlug]
  );
  const orgFundraisesAll = useMemo(
    () => (isOrgMode ? getFundraisesByOrganization(orgSlug) : []),
    [isOrgMode, orgSlug]
  );
  const orgFundraises = useMemo(() => {
    if (selectedGrantId !== null) {
      return orgFundraisesAll.filter((f) => f.grantId === selectedGrantId);
    }
    return orgFundraisesAll;
  }, [orgFundraisesAll, selectedGrantId]);

  const orgActivities = useMemo(() => {
    if (!isOrgMode) return [];
    if (selectedGrantId !== null) {
      return getActivitiesByOrganization(orgSlug).filter(
        (a) => a.grantId === selectedGrantId
      );
    }
    return getActivitiesByOrganization(orgSlug);
  }, [isOrgMode, orgSlug, selectedGrantId]);

  const orgFundraiseCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    orgGrants.forEach((grant) => {
      if (typeof grant.id === 'number') {
        counts[grant.id] = orgFundraisesAll.filter((f) => f.grantId === grant.id).length;
      }
    });
    return counts;
  }, [orgGrants, orgFundraisesAll]);

  const orgGrantTitles = useMemo(() => {
    const titles: Record<number, string> = {};
    orgGrants.forEach((grant) => {
      if (typeof grant.id === 'number') {
        titles[grant.id] = grant.title;
      }
    });
    return titles;
  }, [orgGrants]);

  const selectedOrgGrant =
    isOrgMode && selectedGrantId
      ? orgGrants.find((g) => g.id === selectedGrantId) ?? null
      : null;

  // ── Tab definitions ────────────────────────────────────────────────────
  const topicTabs = FUNDING_TOPICS.map((t) => ({
    id: t.id,
    label: t.label,
  }));

  // ── Navigation ─────────────────────────────────────────────────────────
  const handleTopicChange = (topicId: string) => {
    const params = new URLSearchParams();
    if (topicId !== 'all') {
      params.set('topic', topicId);
    }
    router.push(`/fund/explore?${params.toString()}`, { scroll: false });
  };

  const handleGrantSelect = (grantId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (grantId === null) {
      params.delete('grant');
    } else {
      params.set('grant', grantId.toString());
    }
    router.push(`/fund/explore?${params.toString()}`, { scroll: false });
  };

  const handleBackToBrowse = () => {
    router.push('/fund/explore', { scroll: false });
  };

  // ── Right sidebar ──────────────────────────────────────────────────────
  const rightSidebarContent = (
    <FundingActivityFeed
      activities={isOrgMode ? orgActivities : activeActivities}
      selectedGrantTitle={(isOrgMode ? selectedOrgGrant : selectedGrant)?.title}
      maxItems={12}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PageLayout rightSidebar={rightSidebarContent}>
      <MainPageHeader
        icon={<Icon name="solidHand" size={26} color="#3971ff" />}
        title="Explore Funding"
        subtitle="Browse proposals seeking funding across research topics"
        showTitle={true}
      />

      {isOrgMode && selectedOrg ? (
        /* ─── Organization Detail Mode ──────────────────────────────── */
        <>
          <div className="mt-8">
            <OrgHeader organization={selectedOrg} onBack={handleBackToBrowse} />
          </div>

          <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
            <button
              onClick={() => setOrgTab('opportunities')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                orgTab === 'opportunities'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setOrgTab('impact')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                orgTab === 'impact'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Impact
            </button>
          </div>

          {orgTab === 'impact' ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-lg font-medium mb-1">Coming soon</p>
              <p className="text-sm">Impact metrics and reports will appear here.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <GrantFilter
                  grants={orgGrants}
                  selectedGrantId={selectedGrantId}
                  onSelectGrant={handleGrantSelect}
                  fundraiseCounts={orgFundraiseCounts}
                  totalFundraiseCount={orgFundraisesAll.length}
                />
              </div>

              {selectedOrgGrant && <GrantDetailCard grant={selectedOrgGrant} />}

              <FundraiseGrid
                fundraises={orgFundraises}
                grantTitles={orgGrantTitles}
                showGrantBadge={selectedGrantId === null}
                isLoading={false}
              />
            </>
          )}
        </>
      ) : (
        /* ─── Default Browse Mode (Consolidated) ──────────────────── */
        <>
          {/* Topic Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <Tabs
              tabs={topicTabs}
              activeTab={topicParam}
              onTabChange={handleTopicChange}
            />
          </div>

          {/* Funding Opportunities Carousel */}
          {topicGrants.length > 0 && (
            <div className="mt-6">
              <GrantFilter
                grants={topicGrants}
                selectedGrantId={selectedGrantId}
                onSelectGrant={handleGrantSelect}
                fundraiseCounts={fundraiseCounts}
                totalFundraiseCount={topicFundraises.length}
              />
            </div>
          )}

          {/* Selected Grant Detail */}
          {selectedGrant && (
            <div className="mt-6">
              <GrantDetailCard grant={selectedGrant} />
            </div>
          )}

          {/* Proposals Grid */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedGrant ? 'Proposals' : 'Proposals Seeking Funding'}
              </h2>
              <span className="text-sm font-medium text-gray-400">
                ({activeFundraises.length})
              </span>
            </div>
            <FundraiseGrid
              fundraises={activeFundraises}
              grantTitles={grantTitles}
              showGrantBadge={selectedGrantId === null}
              isLoading={false}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}

// ─── Grant Detail Card ────────────────────────────────────────────────────────

function GrantDetailCard({ grant }: { grant: Grant }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{grant.organization}</span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{grant.title}</h3>
            <p className="text-gray-600 leading-relaxed max-w-2xl">{grant.description}</p>
          </div>

          <div className="flex items-center text-sm text-gray-500 pt-2">
            <span className="text-green-600 font-medium">{grant.amount.formatted}</span>

            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-3" />

            <span>
              Status:{' '}
              <span className="text-gray-900 font-medium capitalize">
                {grant.status.toLowerCase()}
              </span>
            </span>

            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-3" />

            <span className="text-gray-900 font-medium">
              {formatDeadline(grant.endDate)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <Link
            href={`/fund/new?grant=${grant.id}`}
            className="flex items-center justify-between gap-4 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-all hover:shadow-md group/btn w-full"
          >
            <span className="font-semibold text-lg">Apply Now</span>
            <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
          </Link>
          <p className="text-sm text-gray-600 text-center w-full">Submit a proposal</p>
        </div>
      </div>
    </div>
  );
}
