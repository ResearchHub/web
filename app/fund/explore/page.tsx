'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { FundraiseGrid, FundingActivityFeed, OrgHeader } from '@/components/Fund/explore';
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
    ? (topicGrants.find((g) => g.id === selectedGrantId) ?? null)
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
      return getActivitiesByOrganization(orgSlug).filter((a) => a.grantId === selectedGrantId);
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
    isOrgMode && selectedGrantId ? (orgGrants.find((g) => g.id === selectedGrantId) ?? null) : null;

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
            <FundraiseGrid
              fundraises={orgFundraises}
              grantTitles={orgGrantTitles}
              showGrantBadge={selectedGrantId === null}
              isLoading={false}
              grants={orgGrants}
              selectedGrant={selectedOrgGrant}
              selectedGrantId={selectedGrantId}
              onSelectGrant={handleGrantSelect}
              fundraiseCounts={orgFundraiseCounts}
              totalFundraiseCount={orgFundraisesAll.length}
            />
          )}
        </>
      ) : (
        /* ─── Default Browse Mode (Consolidated) ──────────────────── */
        <>
          {/* Topic Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <Tabs tabs={topicTabs} activeTab={topicParam} onTabChange={handleTopicChange} />
          </div>

          {/* Proposals Grid with integrated opportunity selector */}
          <div className="mt-8">
            <FundraiseGrid
              fundraises={activeFundraises}
              grantTitles={grantTitles}
              showGrantBadge={selectedGrantId === null}
              isLoading={false}
              grants={topicGrants}
              selectedGrant={selectedGrant}
              selectedGrantId={selectedGrantId}
              onSelectGrant={handleGrantSelect}
              fundraiseCounts={fundraiseCounts}
              totalFundraiseCount={topicFundraises.length}
            />
          </div>
        </>
      )}
    </PageLayout>
  );
}
