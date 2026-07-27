'use client';

import { useCallback, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/pro-solid-svg-icons';
import { FileText, Waves, type LucideIcon, type LucideProps } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PillTabs, type PillTab } from '@/components/ui/PillTabs';
import { Tabs } from '@/components/ui/Tabs';
import { ActivityCardFull } from '@/components/Activity/ActivityCardFull';
import { ActivityCardSkeletonList } from '@/components/Activity/ActivityCardSkeleton';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundGrantsPageContent } from '@/app/fund/FundGrantsPageContent';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { cn } from '@/utils/styles';
import type { FeedEntry } from '@/types/feed';
import { HomeSidebar } from './HomeSidebar';
import { NewMenu } from './NewMenu';
import { HomeWalletCard } from './HomeWalletCard';
import { RecentlyVisitedCard, useRecentlyVisited } from './RecentlyVisitedCard';
import { MyFundingTab } from './MyFundingTab';
import { FundingActivityFeed } from './FundingActivityFeed';
import { MineStrip } from './MineStrip';
import { PatternPicker } from './PatternPicker';
import { ScopeBanner, ScopeLens, ScopeModeSwitch } from './ScopeSwitcher';
import { useHomeScope } from './useHomeScope';

/** What the marketplace side of the hub is showing. */
type HubView = 'activity' | 'grants' | 'proposals';

/** Sized via PillTabs' className to match Lucide stroke icons in the pills. */
function BullhornIcon({ className }: LucideProps) {
  return <FontAwesomeIcon icon={faBullhorn} className={className} />;
}

const hubViews: PillTab[] = [
  { id: 'activity', label: 'Activity', icon: Waves },
  { id: 'grants', label: 'Request for Proposals', icon: BullhornIcon as LucideIcon },
  { id: 'proposals', label: 'Proposals', icon: FileText },
];

/** The page title, in the display face. Sits at the leading edge of the top bar
 *  on desktop and centered in the minimal bar on mobile. */
function HeroTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h1
      className={cn(
        'whitespace-nowrap text-xl sm:text-[26px] font-semibold leading-none tracking-[-0.032em] text-[#0b1530]',
        className
      )}
      style={{ fontFamily: "'Cal Sans', var(--font-geist-sans), system-ui, sans-serif" }}
    >
      {children}
    </h1>
  );
}

interface MarketplaceFeedProps {
  entries: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/** The unscoped feed: everything happening across the marketplace. */
function MarketplaceFeed({
  entries,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMore,
}: MarketplaceFeedProps) {
  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: useCallback(
      (inView: boolean) => {
        if (inView && hasMore && !isLoading && !isLoadingMore) {
          loadMore();
        }
      },
      [hasMore, isLoading, isLoadingMore, loadMore]
    ),
  });

  return (
    <div>
      {entries.map((entry) => (
        <ActivityCardFull
          key={entry.id}
          entry={entry}
          hideReviewToggle
          showThumbnail
          highlightReviewOpportunities
        />
      ))}

      {(isLoading || isLoadingMore) && <ActivityCardSkeletonList />}

      {!isLoading && !isLoadingMore && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No activity found</p>
        </div>
      )}

      {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}

/** The scoped rendering of a view: the same cards, filtered to the viewer. */
function MineFeed({
  entries,
  isLoading,
  emptyLabel,
}: {
  entries: FeedEntry[];
  isLoading: boolean;
  emptyLabel: string;
}) {
  if (isLoading) return <ActivityCardSkeletonList />;

  if (entries.length === 0) {
    return (
      <div className="my-6 rounded-xl border border-dashed border-gray-200 py-12 text-center">
        <p className="text-sm text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <ActivityCardFull key={entry.id} entry={entry} hideReviewToggle showThumbnail />
      ))}
    </div>
  );
}

export function HomeFundingHub() {
  const [view, setView] = useState<HubView>('activity');
  const { scope, setScope, pattern, setPattern, variations, toggleVariation } = useHomeScope();
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useActivityFeed();
  const recentlyVisited = useRecentlyVisited();

  const stakeEntries = useMemo(() => entries.filter((entry) => entry.isViewerStake), [entries]);
  const mineCount = stakeEntries.length;

  const isScoped = scope === 'mine';
  // Both of these swap the page for the funder dashboard rather than filtering
  // the feed; they differ only in where the switch that got you here lives.
  const isFundingMode = pattern === 'mode' && isScoped;
  const isFundingDestination = pattern === 'sidebar' && isScoped;
  const showsFundingSurface = isFundingMode || isFundingDestination;
  const pageTitle = showsFundingSurface ? 'Your Funding' : 'Fund Scientific Research';

  const scopedEntries = useMemo(() => {
    if (view === 'grants') return stakeEntries.filter((e) => e.contentType === 'GRANT');
    if (view === 'proposals') return stakeEntries.filter((e) => e.contentType !== 'GRANT');
    return stakeEntries;
  }, [view, stakeEntries]);

  // The funding surface opens with the same balances in its summary bar, so the
  // wallet only rides along on the market side. Both halves of the column can
  // empty out, and the panel is dropped rather than left standing empty.
  const showsWallet = !showsFundingSurface;
  const showsRecentlyVisited = recentlyVisited.pages.length > 0;
  // Dropping the column entirely lets the layout recentre the feed on the page
  // rather than leaving it sitting off to one side (see HOME_VARIATIONS).
  const sidebarContent = !variations.noRightSidebar && (showsWallet || showsRecentlyVisited) && (
    <div>
      {showsWallet && <HomeWalletCard className="w-full" />}
      {showsRecentlyVisited && (
        <RecentlyVisitedCard
          {...recentlyVisited}
          className={cn('w-full', showsWallet && 'mt-4 border-t border-gray-200/80 pt-4')}
        />
      )}
    </div>
  );

  const scopeControl =
    pattern === 'lens' ? (
      <ScopeLens scope={scope} onScopeChange={setScope} mineCount={mineCount} />
    ) : null;

  // The create action lives in exactly one place, so the top bar keeps it only
  // while the sidebar isn't carrying it. With neither control the slot is
  // dropped entirely rather than left as an empty wrapper.
  const showsTopBarPost = !variations.sidebarPost;
  const showsModeSwitch = pattern === 'mode';
  const topBarControls = (showsModeSwitch || showsTopBarPost) && (
    <>
      {showsModeSwitch && (
        <ScopeModeSwitch scope={scope} onScopeChange={setScope} mineCount={mineCount} />
      )}
      {showsTopBarPost && <NewMenu variant="topbar" />}
    </>
  );

  const tabBar = variations.underlineTabs ? (
    <div className="min-w-0 flex-1 border-b border-gray-200">
      <Tabs
        tabs={hubViews}
        activeTab={view}
        onTabChange={(id) => setView(id as HubView)}
        size="sm"
        className="border-b-0"
      />
    </div>
  ) : (
    <PillTabs
      className="min-w-0 flex-1"
      tabs={hubViews}
      activeTab={view}
      onTabChange={(id) => setView(id as HubView)}
      size="lg"
    />
  );

  const renderContent = () => {
    if (showsFundingSurface) {
      return (
        <MyFundingTab
          entries={entries}
          isLoading={isLoading}
          // Opportunities are marketplace-wide, so the drill-down leaves the
          // funder surface rather than filtering inside it.
          onBrowseOpportunities={() => setScope('all')}
        />
      );
    }

    if (isScoped) {
      // Scoped activity is a different feed, not a filtered one — it is
      // organised by position rather than by actor. See FundingActivityFeed.
      if (view === 'activity') {
        return <FundingActivityFeed entries={stakeEntries} isLoading={isLoading} />;
      }
      return (
        <MineFeed
          entries={scopedEntries}
          isLoading={isLoading}
          emptyLabel={
            view === 'grants'
              ? "You haven't opened an RFP yet."
              : "You haven't backed a proposal yet."
          }
        />
      );
    }

    if (view === 'grants') return <FundGrantsPageContent />;

    if (view === 'proposals') {
      return (
        <div>
          <ProposalSortAndFilters />
          <ProposalFeed />
        </div>
      );
    }

    return (
      <MarketplaceFeed
        entries={entries}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
      />
    );
  };

  return (
    <PageLayout
      leftSidebar={
        <HomeSidebar
          activeItem={isScoped ? 'funding' : 'home'}
          onSelect={(item) => setScope(item === 'funding' ? 'mine' : 'all')}
          fundingCount={mineCount}
          showPostButton={variations.sidebarPost}
        />
      }
      rightSidebar={sidebarContent}
      topBarMinimalMobile
      topBarRightSlot={
        topBarControls && <div className="flex items-center gap-2">{topBarControls}</div>
      }
      topBarLeftSlot={<HeroTitle className="hidden tablet:!block">{pageTitle}</HeroTitle>}
      topBarCenterSlot={<HeroTitle className="tablet:!hidden">{pageTitle}</HeroTitle>}
    >
      <div
        className={cn(
          'transition-[padding,background-color] duration-150',
          // The lens pattern leans on the surface itself to signal the scoped
          // state, since its control is a bare avatar with no label.
          pattern === 'lens' &&
            isScoped &&
            'rounded-2xl border-l-2 border-l-primary-500 bg-primary-50/30 px-4'
        )}
      >
        {!showsFundingSurface && (
          <div
            className={cn(
              'flex gap-3 pb-2',
              variations.underlineTabs ? 'items-end' : 'items-center justify-between'
            )}
          >
            {tabBar}
            {scopeControl && (
              <div className={cn('flex-shrink-0', variations.underlineTabs && 'pb-2')}>
                {scopeControl}
              </div>
            )}
          </div>
        )}

        {pattern === 'pinned' && <MineStrip entries={stakeEntries} />}

        {/* Modes and destinations already announce themselves in the chrome;
            the banner only exists to catch a filter left silently on. */}
        {isScoped && !showsFundingSurface && (
          <ScopeBanner mineCount={mineCount} onExit={() => setScope('all')} />
        )}

        {renderContent()}
      </div>

      <PatternPicker
        pattern={pattern}
        onPatternChange={setPattern}
        variations={variations}
        onVariationToggle={toggleVariation}
      />
    </PageLayout>
  );
}
