'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SearchModal } from '@/components/Search/SearchModal';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { Logo } from '@/components/ui/Logo';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { useFundTabs } from '@/hooks/useFundTabs';
import { useFeedTabsVisibility } from '@/contexts/FeedTabsVisibilityContext';
import { useTopBarSlot } from '@/contexts/TopBarSlotContext';
import { useSmartBack } from '@/hooks/useSmartBack';
import { usePendingCounts } from '@/components/Moderators/PendingCountsContext';

import { getPageInfo, isRootNavigationPage } from './topbar/pageRoutes';
import { TopBarBackButton } from './topbar/TopBarBackButton';
import { TopBarBreadcrumb } from './topbar/TopBarBreadcrumb';
import { TopBarUserControls } from './topbar/TopBarUserControls';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const goBack = useSmartBack();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { totalCount: pendingModerationCount } = usePendingCounts();
  const { showAuthModal } = useAuthModalContext();

  const { tabs, highlightedTab, handleTabChange, isFeedPage } = useFeedTabs();
  const {
    tabs: fundTabs,
    highlightedTab: fundHighlightedTab,
    handleTabChange: handleFundTabChange,
    isFundPage,
  } = useFundTabs();
  const { contentTabsHidden } = useFeedTabsVisibility();
  const showTopBarFeedTabs = isFeedPage && contentTabsHidden;
  const showTopBarFundTabs = isFundPage && contentTabsHidden;
  const showTopBarTabs = showTopBarFeedTabs || showTopBarFundTabs;

  // A page (e.g. the notebook) can inject a custom control here in place of the
  // default breadcrumb.
  const topBarSlot = useTopBarSlot();
  const leftSlot = topBarSlot?.leftSlot;

  const pageInfo = getPageInfo(pathname);
  const showBackButton = pageInfo && !isRootNavigationPage(pathname);

  const profilePercent = useCallback(() => {
    if (!user) return 100;
    return calculateProfileCompletion(user).percent;
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewProfile = () => {
    if (user?.authorProfile?.profileUrl) {
      router.push(user.authorProfile.profileUrl);
    }
  };

  const openSearch = () => setIsSearchModalOpen(true);

  return (
    <>
      <div className="bg-white border-b border-gray-200">
        {/* Title row */}
        <div className="flex items-center justify-between px-4 lg:px-8 h-[var(--top-bar-height)]">
          {/* Left side */}
          <div className="flex items-center min-w-0 flex-1 mr-4 h-full">
            <Link href="/" className="block tablet:!hidden mr-2">
              <div className="rounded-full bg-gray-100 flex items-center justify-center w-11 h-11">
                <Logo noText size={36} className="mt-[-2px]" />
              </div>
            </Link>

            {leftSlot ? (
              <div className="flex min-w-0 items-center">{leftSlot}</div>
            ) : (
              <>
                {showBackButton && <TopBarBackButton onClick={goBack} variant="mobile" />}

                {pageInfo && <TopBarBreadcrumb pageInfo={pageInfo} variant="mobile" />}

                {showBackButton && <TopBarBackButton onClick={goBack} variant="desktop" />}

                {pageInfo && <TopBarBreadcrumb pageInfo={pageInfo} variant="desktop" />}
              </>
            )}

            {/* Inline content tabs — desktop only, shown once page tabs scroll away */}
            {showTopBarFeedTabs && (
              <div className="hidden tablet:!flex items-center ml-4">
                <FeedTabs
                  activeTab={highlightedTab}
                  tabs={tabs}
                  onTabChange={handleTabChange}
                  isCompact={false}
                />
              </div>
            )}
            {showTopBarFundTabs && (
              <div className="hidden tablet:!flex items-center ml-4">
                <FeedTabs
                  activeTab={fundHighlightedTab}
                  tabs={fundTabs}
                  onTabChange={handleFundTabChange}
                  isCompact={false}
                />
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 h-full">
            <TopBarUserControls
              user={user}
              isLoading={isLoading}
              unreadCount={unreadCount}
              pendingModerationCount={pendingModerationCount}
              avatarSize={32}
              profilePercent={profilePercent()}
              onViewProfile={handleViewProfile}
              onAuth={() => showAuthModal()}
              onSearchOpen={openSearch}
              variant="desktop"
            />

            <TopBarUserControls
              user={user}
              isLoading={isLoading}
              unreadCount={unreadCount}
              pendingModerationCount={pendingModerationCount}
              avatarSize={40}
              profilePercent={profilePercent()}
              onViewProfile={handleViewProfile}
              onAuth={() => showAuthModal()}
              onSearchOpen={openSearch}
              variant="mobile"
            />
          </div>
        </div>

        {/* Feed tabs — mobile only, stacked below title when content tabs scroll out of view */}
        {(isFeedPage || isFundPage) && (
          <div
            className="tablet:!hidden overflow-hidden transition-all duration-300 ease-in-out border-b px-4 -mt-2 pb-1"
            style={{
              maxHeight: showTopBarTabs ? '62px' : '0px',
              opacity: showTopBarTabs ? 1 : 0,
              borderBottomColor: showTopBarTabs ? undefined : 'transparent',
            }}
          >
            {isFeedPage && (
              <FeedTabs
                activeTab={highlightedTab}
                tabs={tabs}
                onTabChange={handleTabChange}
                isCompact={false}
              />
            )}
            {isFundPage && (
              <FeedTabs
                activeTab={fundHighlightedTab}
                tabs={fundTabs}
                onTabChange={handleFundTabChange}
                isCompact={false}
              />
            )}
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
