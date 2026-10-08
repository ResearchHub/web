'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { useEarningOverview } from '@/components/Earn/lib/hooks/useEarningOverview';
import { FundingPowerCard } from '@/components/Funding/FundingPowerCard';
import { ModeratorViewAsFunder } from '@/components/Funding/dashboard/ModeratorViewAsFunder';
import {
  DECK_SIZE,
  GENERIC_COVERS,
  MyFundingHero,
  MyFundingWelcomeHero,
  type HeroCover,
} from '@/components/Funding/dashboard/MyFundingHero';
import { MyFundingRail, MyFundingRailSkeleton } from '@/components/Funding/dashboard/MyFundingRail';
import { PeopleModal } from '@/components/Funding/dashboard/PeopleModal';
import {
  parseViewedFunderId,
  useFunderOverview,
} from '@/components/Funding/dashboard/hooks/useFunderOverview';
import { useMyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import { useMyFundingDocuments } from '@/components/Funding/dashboard/hooks/useMyFundingDocuments';
import { useMyFundingSeen } from '@/components/Funding/dashboard/hooks/useMyFundingSeen';
import { useViewedAuthorId } from '@/components/Funding/dashboard/hooks/useViewedAuthorId';
import {
  buildFundedRows,
  buildOwnFunders,
  buildOwnProposals,
  buildRfpCards,
  buildSupportedPeople,
  buildUpNext,
  lastOwnUpdates,
  latestNewsByPost,
  type FundedRow,
  type Money,
  type OwnProposalModel,
  type RfpCardModel,
} from '@/components/Funding/dashboard/lib/myFundingModel';
import { useMoneyFormat } from '@/components/Funding/dashboard/lib/useMoneyFormat';
import {
  RadiatingDotTabIcon,
  RadiatingDotTabIconActive,
} from '@/components/ui/RadiatingDotTabIcon';
import { Tabs } from '@/components/ui/Tabs';
import { useFundingDocuments } from '@/contexts/FundingDocumentsContext';
import { useUser } from '@/contexts/UserContext';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityCommentType } from '@/services/activity.service';
import type { EarningAmount } from '@/types/user';
import { cn } from '@/utils/styles';
import { MyFundingActivityContent } from './MyFundingActivityContent';
import { MyFundingContent, type MyFundingTab } from './MyFundingContent';
import { MyFundingDataError } from './MyFundingDataError';
import { MyFundingSignedOut } from './MyFundingSignedOut';
import { buildHeroCopy } from './myFundingCopy';

/** Stable reference: a new array on every render would restart the activity feed. */
const PEER_REVIEW_COMMENT_TYPES: readonly ActivityCommentType[] = ['REVIEW', 'PEER_REVIEW'];

const TABS: readonly MyFundingTab[] = [
  'overview',
  'funded',
  'rfps',
  'proposals',
  'reviews',
  'activity',
];

const ZERO: Money = { usd: 0, rsc: 0 };

const sumMoney = (amounts: readonly Money[]): Money =>
  amounts.reduce(
    (total, amount) => ({ usd: total.usd + amount.usd, rsc: total.rsc + amount.rsc }),
    ZERO
  );

/** Earned amounts keep RSC at its value when earned, beside any USD. */
const earnedMoney = (amounts: (EarningAmount | undefined)[]): Money =>
  amounts.reduce<Money>(
    (total, amount) => ({
      usd: total.usd + (amount ? amount.rscUsdSnapshot + amount.usd : 0),
      rsc: total.rsc + (amount?.rsc ?? 0),
    }),
    ZERO
  );

function TabLabel({ label, count }: { readonly label: string; readonly count?: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {count != null && count > 0 && (
        <span className="rounded-full bg-gray-200/80 px-1.5 text-xs font-semibold text-gray-600">
          {count}
        </span>
      )}
    </span>
  );
}

/**
 * My Funding, built from what its user does rather than what they say they
 * are: what they gave and to whom, the RFPs they run, the proposals they wrote
 * and the reviews they published. Each side they are on adds its tab, its
 * sections and its part of the rail; someone who has done nothing yet gets the
 * ways in.
 */
export function MyFundingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isLoadingUser } = useUser();
  const format = useMoneyFormat();
  const isModerator = !!user?.isModerator;

  // A moderator may view another user's page, and sees it as that user does:
  // in the first person, with their proposals, reviews and earnings. Only what
  // belongs to the moderator's own account (drafts, balance, seen marks) stays theirs.
  const viewedUserId =
    (isModerator ? parseViewedFunderId(searchParams.get('user_id')) : undefined) ?? user?.id;
  const isOwnPage = viewedUserId != null && viewedUserId === user?.id;
  const viewedAuthor = useViewedAuthorId({
    viewedUserId,
    isOwnPage,
    ownAuthorId: user?.authorProfile?.id,
  });
  const authorId = viewedAuthor.authorId;
  const requestedTab = searchParams.get('tab') as MyFundingTab | null;
  // Fixed for the visit, so "days left" and "days ago" agree everywhere on the page.
  const [now] = useState(() => Date.now());

  const overview = useFunderOverview(viewedUserId);
  const earnings = useEarningOverview(viewedUserId);
  const documents = useMyFundingDocuments({ viewedUserId });
  const activity = useMyFundingActivity({ viewedUserId, authorId });
  const readsReviews = authorId != null && authorId > 0;
  const reviews = useActivityFeed({
    authorId: readsReviews ? authorId : undefined,
    contentType: 'RHCOMMENTMODEL',
    commentTypes: PEER_REVIEW_COMMENT_TYPES,
    enabled: readsReviews,
  });
  // Once the feed pages, its count becomes the number of rows loaded, so the
  // total it first reported is the one kept.
  const [reviewTotal, setReviewTotal] = useState(0);
  useEffect(() => {
    setReviewTotal((total) => Math.max(total, reviews.count));
  }, [reviews.count]);
  const seen = useMyFundingSeen(user?.id, isOwnPage);
  const { drafts, status: draftsStatus } = useFundingDocuments();

  const rfpDocuments = useMemo(
    () => documents.published.filter((document) => document.kind === 'rfp'),
    [documents.published]
  );
  const givingOverview = overview.error ? null : overview.overview;
  const news = useMemo(() => latestNewsByPost(activity.entries), [activity.entries]);
  const fundedRows = useMemo(() => buildFundedRows(givingOverview, news), [givingOverview, news]);
  const people = useMemo(() => buildSupportedPeople(fundedRows), [fundedRows]);
  // What the user gave to each proposal, which RFPs count as committed budget.
  const givenByProposal = useMemo(
    () =>
      new Map(
        (givingOverview?.supportedProposals ?? []).map((proposal) => [
          proposal.id,
          proposal.fundedAmount,
        ])
      ),
    [givingOverview]
  );
  const rfps = useMemo(
    () => buildRfpCards(documents.published, givenByProposal, now),
    [documents.published, givenByProposal, now]
  );
  const ownProposals = useMemo(
    () => buildOwnProposals(documents.published, lastOwnUpdates(activity.entries, authorId), now),
    [documents.published, activity.entries, authorId, now]
  );
  const ownFunders = useMemo(
    () => buildOwnFunders(ownProposals, authorId),
    [ownProposals, authorId]
  );
  const upNext = useMemo(
    () =>
      buildUpNext({
        rfps,
        newProposalCount: seen.newProposalCount,
        ownProposals,
        format: (amount) => format(amount, { shorten: true }),
        now,
      }),
    [rfps, seen.newProposalCount, ownProposals, format, now]
  );

  // Every source has had its first load, so nothing on the page will jump.
  const isSettled =
    !overview.isLoading &&
    documents.isSettled &&
    !viewedAuthor.isLoading &&
    !earnings.isLoading &&
    // The draft the empty state offers to pick up.
    (!isOwnPage || draftsStatus !== 'loading') &&
    (!readsReviews || !reviews.isLoading);

  // RFPs never looked at before start counting new proposals from now, once
  // their full list of proposals has loaded.
  useEffect(() => {
    if (isSettled && rfps.length > 0) {
      seen.setProposalBaselines(rfps.map(({ postId, proposalIds }) => ({ postId, proposalIds })));
    }
  }, [isSettled, rfps, seen]);

  const activeTab: MyFundingTab =
    requestedTab && TABS.includes(requestedTab) ? requestedTab : 'overview';
  const [activityOpened, setActivityOpened] = useState(false);
  useEffect(() => {
    if (activeTab !== 'activity') return;
    setActivityOpened(true);
    seen.markActivitySeen();
  }, [activeTab, seen]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabId === 'overview') params.delete('tab');
      else params.set('tab', tabId);
      const query = params.toString();
      router.push(`/my-funding${query ? `?${query}` : ''}`, { scroll: false });
    },
    [router, searchParams]
  );

  const [peopleOpen, setPeopleOpen] = useState<'scientists' | 'funders' | null>(null);

  // The page's frame and a placeholder header while the account loads, so
  // nothing pops in around the header later.
  if (isLoadingUser) return <MyFundingLoading />;
  // Signed out, the page previews what it will hold and what is open now.
  if (!user || viewedUserId == null) return <MyFundingSignedOut />;

  const given = givingOverview?.totalGiven ?? ZERO;
  const raised = sumMoney(ownProposals.map((proposal) => proposal.raised));
  const reviewEarned = earnedMoney([
    earnings.overview?.bySource.TIP_REVIEW,
    earnings.overview?.bySource.BOUNTY_PAYOUT,
  ]);
  const hasFunded = fundedRows.length > 0;
  const hasRfps = rfps.length > 0;
  const hasProposals = ownProposals.length > 0;
  const hasReviews = reviewTotal > 0;
  const isEmpty = isSettled && !hasFunded && !hasRfps && !hasProposals && !hasReviews;

  // Ways to take part for someone with nothing here yet. Starting an RFP or a
  // proposal happens from the Publish menu, not this page.
  const welcomeActions = (
    <>
      <Link
        href="/fund/proposals"
        className="inline-flex h-11 items-center rounded-lg bg-primary-500 px-5 text-[15px] font-semibold text-white hover:bg-primary-600"
      >
        Back a proposal
      </Link>
      <Link
        href="/fund"
        className="inline-flex h-11 items-center rounded-lg border border-gray-300 bg-white px-5 text-[15px] font-semibold text-gray-700 hover:bg-gray-50"
      >
        See open RFPs
      </Link>
    </>
  );

  const copy = buildHeroCopy(
    {
      given,
      raised,
      asked: sumMoney(ownProposals.map((proposal) => proposal.goal)),
      reviewEarned,
      fundedCount: fundedRows.length,
      rfpCount: rfps.length,
      rfpBudget: sumMoney(rfps.map((rfp) => rfp.budget)),
      ownCount: ownProposals.length,
    },
    format
  );

  const newActivity =
    seen.activitySeenAt != null && !activityOpened
      ? activity.entries.filter(
          (entry) => new Date(entry.timestamp).getTime() > seen.activitySeenAt!
        ).length
      : 0;

  // Overview and Activity first: every page has them. Each side the user is on adds its own tab.
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      iconClassName: 'h-[18px] w-[18px]',
    },
    {
      id: 'activity',
      label: (
        <span className="flex items-center gap-1.5">
          Activity
          {newActivity > 0 && (
            <span className="rounded-full bg-primary-100 px-1.5 text-xs font-semibold text-primary-700">
              {newActivity} new
            </span>
          )}
        </span>
      ),
      icon: RadiatingDotTabIcon,
      activeIcon: RadiatingDotTabIconActive,
      iconClassName: 'h-[18px] w-[18px]',
    },
    ...(hasFunded
      ? [{ id: 'funded', label: <TabLabel label="Funded" count={fundedRows.length} /> }]
      : []),
    ...(hasRfps ? [{ id: 'rfps', label: <TabLabel label="RFPs" count={rfps.length} /> }] : []),
    ...(hasProposals
      ? [{ id: 'proposals', label: <TabLabel label="Proposals" count={ownProposals.length} /> }]
      : []),
    ...(hasReviews
      ? [{ id: 'reviews', label: <TabLabel label="Reviews" count={reviewTotal} /> }]
      : []),
  ];

  // The hero keeps the tab bar to the main column's width.
  const tabBar = (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      // The moderator's switch rides at the tab bar's right end at every width;
      // the tabs scroll beside it on a phone.
      rightContent={
        isModerator && (
          <div className="flex items-center">
            <ModeratorViewAsFunder />
          </div>
        )
      }
    />
  );

  const covers = heroCovers(fundedRows, hasProposals ? ownProposals : [], rfps, format);

  const hero = isEmpty ? (
    <MyFundingWelcomeHero
      line="This page fills in as you fund research, open RFPs, write proposals and review."
      actions={welcomeActions}
    />
  ) : !isSettled ? (
    <HeroSkeleton />
  ) : (
    <MyFundingHero headline={copy.headline} line={copy.line} covers={covers} tabs={tabBar} />
  );

  // The whole rail shows for everyone; like the header, it waits until every
  // source has loaded.
  const rail = !isSettled ? (
    <MyFundingRailSkeleton />
  ) : (
    <MyFundingRail
      given={given}
      matched={givingOverview?.communityMatch}
      raised={hasProposals ? raised : undefined}
      reviewEarned={hasReviews ? reviewEarned : undefined}
      people={people}
      institutions={givingOverview?.supportedInstitutions}
      funders={hasProposals ? ownFunders : undefined}
      onShowAll={setPeopleOpen}
    />
  );

  const latestDraft = isOwnPage ? drafts[0] : undefined;

  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebar={rail}
      rightSidebarAbove={isOwnPage ? <FundingPowerCard className="w-full" /> : undefined}
      rightSidebarTopOffset="aligned"
      topBanner={hero}
    >
      {(overview.error || documents.error) && (
        <div className="mb-4">
          <MyFundingDataError message="Some funding data failed to load. Please refresh and try again." />
        </div>
      )}

      {activeTab === 'activity' && !isEmpty ? (
        <MyFundingActivityContent
          activity={activity}
          seenAt={seen.activitySeenAt}
          firstScientist={people[0]?.profile.fullName}
          hasRfps={hasRfps}
        />
      ) : (
        <MyFundingContent
          tab={activeTab === 'activity' || isEmpty ? 'overview' : activeTab}
          isSettled={isSettled && !activity.isLoading}
          isEmpty={isEmpty}
          latestDraft={latestDraft}
          lead={copy.lead}
          upNext={upNext}
          fundedRows={fundedRows}
          rfps={rfps}
          ownProposals={hasProposals ? ownProposals : []}
          rfpEntries={new Map(rfpDocuments.map((document) => [document.postId, document.entry]))}
          proposalEntries={
            new Map(
              documents.published
                .filter((document) => document.kind === 'proposal')
                .map((document) => [document.postId, document.entry])
            )
          }
          reviews={{
            entries: readsReviews ? reviews.entries : [],
            total: reviewTotal,
            hasMore: reviews.hasMore,
            isLoadingMore: reviews.isLoadingMore,
            loadMore: reviews.loadMore,
          }}
          activity={activity}
          now={now}
          seen={seen}
          onTabChange={handleTabChange}
        />
      )}

      <PeopleModal
        isOpen={peopleOpen === 'scientists'}
        onClose={() => setPeopleOpen(null)}
        title="Scientists you support"
        people={people.map((person) => ({
          profile: person.profile,
          detail: person.proposalTitle,
          amount: format(person.youGave, { shorten: true }),
        }))}
      />
      <PeopleModal
        isOpen={peopleOpen === 'funders'}
        onClose={() => setPeopleOpen(null)}
        title="Your funders"
        people={ownFunders.map((profile) => ({ profile }))}
      />
    </PageLayout>
  );
}

/**
 * The hero's deck: the work the page is about (funded proposals, the user's
 * own, their RFPs), one of each kind first. A deck with fewer than two cards
 * is filled out with generic ones, a green proposal and a blue RFP.
 */
function heroCovers(
  fundedRows: readonly FundedRow[],
  ownProposals: readonly OwnProposalModel[],
  rfps: readonly RfpCardModel[],
  format: (amount: Money, options?: { shorten?: boolean }) => string
): HeroCover[] {
  // Ordered by what was given and described by it, so the deck is the same
  // before and after the activity loads.
  // A funded proposal without a cover is drawn with the proposal icon.
  const funded = [...fundedRows]
    .sort((a, b) => b.youGave.usd - a.youGave.usd || b.youGave.rsc - a.youGave.rsc)
    .map(
      (row): HeroCover => ({
        key: row.key,
        title: row.title,
        image: row.image,
        status: `You gave ${format(row.youGave, { shorten: true })}`,
        detail: row.scientist.fullName,
      })
    );
  const own = ownProposals.map(
    (proposal): HeroCover => ({
      key: proposal.key,
      title: proposal.title,
      image: proposal.image,
      ...(proposal.status === 'raising'
        ? {
            percent: proposal.percent ?? 0,
            status: `${format(proposal.raised, { shorten: true })} of ${format(proposal.goal, { shorten: true })}`,
          }
        : {
            status: proposal.status === 'closed' ? 'Closed' : 'Funded',
            detail: `${proposal.funderCount} ${proposal.funderCount === 1 ? 'funder' : 'funders'}`,
          }),
    })
  );
  const rfpCovers = rfps.map(
    (rfp): HeroCover => ({
      key: rfp.key,
      title: rfp.title,
      image: rfp.image,
      tone: 'blue',
      status: rfp.isOpen ? 'RFP · open' : 'RFP · closed',
      detail: `${rfp.proposalCount} ${rfp.proposalCount === 1 ? 'proposal' : 'proposals'}`,
    })
  );

  // One of each kind before seconds, so a busy page still shows its range.
  const groups = [funded, own, rfpCovers];
  const real: HeroCover[] = [];
  for (let round = 0; real.length < 3 && groups.some((group) => group.length > round); round++) {
    for (const group of groups) if (group[round] && real.length < 3) real.push(group[round]);
  }
  if (real.length >= 2) return real;
  if (real.length === 0) return GENERIC_COVERS;
  // One real card: pair it with the generic card of the other kind.
  const realIsRfp = rfpCovers.includes(real[0]);
  return [real[0], GENERIC_COVERS[realIsRfp ? 0 : 1]];
}

/**
 * The header's shape while its contents are being worked out: the headline,
 * the line under it, the deck and the tab bar, at the sizes they will have.
 */
function HeroSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-gray-50" aria-hidden="true">
      <div className="mx-auto max-w-[1012px] animate-pulse px-4 pt-10 tablet:!px-8 sm:pt-12">
        <div className="lg:grid lg:min-h-[302px] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[1fr_auto]">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-center">
            <div className="h-10 w-11/12 rounded-lg bg-gray-200 sm:h-12" />
            <div className="mt-2 h-10 w-2/3 rounded-lg bg-gray-200 sm:h-12" />
            <div className="mt-5 h-5 w-3/4 rounded bg-gray-200" />
          </div>
          <div className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:-mr-6 lg:-mt-12 lg:flex lg:items-center lg:justify-end">
            <div className={cn('flex items-center justify-center', DECK_SIZE.box)}>
              <div className="h-[200px] w-[164px] -rotate-3 rounded-2xl bg-gray-200" />
            </div>
          </div>
          <div className="mt-8 flex h-12 items-center gap-6 border-b border-gray-200 sm:mt-10 lg:col-start-1 lg:row-start-2 lg:self-end">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The whole page while the signed-in account is still loading. */
function MyFundingLoading() {
  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebar={<MyFundingRailSkeleton />}
      rightSidebarAbove={<FundingPowerCard className="w-full" />}
      rightSidebarTopOffset="aligned"
      topBanner={<HeroSkeleton />}
    >
      <ul className="space-y-3" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <li key={index} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </ul>
    </PageLayout>
  );
}
