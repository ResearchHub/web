'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SearchModal } from '@/components/Search/SearchModal';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Menu } from 'lucide-react';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { Tabs } from '@/components/ui/Tabs';
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
  /** Opens or closes the app's menu: the left sidebar, below the width at which it is a column. */
  onMenuClick: () => void;
  readonly isMenuOpen?: boolean;
}

export function TopBar({ onMenuClick, isMenuOpen = false }: TopBarProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const goBack = useSmartBack();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { totalCount: pendingModerationCount } = usePendingCounts();
  const { showAuthModal } = useAuthModalContext();

  const {
    tabs: fundTabs,
    highlightedTab: fundHighlightedTab,
    handleTabChange: handleFundTabChange,
    isFundPage,
  } = useFundTabs();
  const { contentTabsHidden } = useFeedTabsVisibility();
  const showTopBarFundTabs = isFundPage && contentTabsHidden;

  // A page (e.g. the notebook) can inject a custom control here in place of the
  // default breadcrumb.
  const topBarSlot = useTopBarSlot();
  const leftSlot = topBarSlot?.leftSlot;
  // Or keep the back arrow and name what the page has open instead of the page.
  const openTitle = topBarSlot?.title ?? null;

  const routePageInfo = getPageInfo(pathname);
  const pageInfo =
    routePageInfo && openTitle != null ? { ...routePageInfo, title: openTitle } : routePageInfo;
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
        <div className="relative flex items-center justify-between px-4 lg:px-8 h-[var(--top-bar-height)]">
          {/* Left side */}
          <div className="flex items-center min-w-0 flex-1 mr-4 h-full">
            {/* The left sidebar is a column from 1240px up; narrower, this opens it. */}
            <button
              type="button"
              onClick={onMenuClick}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="-ml-2 mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 sidebar-compact:!hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {leftSlot ? (
              <div className="flex min-w-0 items-center">{leftSlot}</div>
            ) : (
              <>
                {showBackButton && <TopBarBackButton onClick={goBack} variant="mobile" />}

                {pageInfo && (
                  <TopBarBreadcrumb
                    pageInfo={isFundPage ? { ...pageInfo, title: 'Fund Science' } : pageInfo}
                    variant="mobile"
                  />
                )}

                {showBackButton && <TopBarBackButton onClick={goBack} variant="desktop" />}

                {pageInfo && (
                  <TopBarBreadcrumb
                    pageInfo={showTopBarFundTabs ? { ...pageInfo, title: 'Fund' } : pageInfo}
                    variant="desktop"
                    truncateTitle={openTitle != null}
                    size={openTitle != null ? 'md' : 'lg'}
                  />
                )}
              </>
            )}
          </div>

          {/* Fund tabs sit on the top bar's bottom border, aligned to PageLayout's
              content column so they don't jump horizontally when they stick.
              Only above content-lg: the content column is centered, so on
              narrower screens it starts close enough to the left edge to run
              into the title. Below that the tabs stack on their own row. */}
          {showTopBarFundTabs && (
            <div className="pointer-events-none absolute inset-0 hidden content-lg:!flex animate-in fade-in duration-200">
              <div className="mx-auto flex h-full w-full max-w-[1012px] px-4 tablet:!px-8">
                <div className="pointer-events-auto flex h-full min-w-0 flex-shrink-0">
                  <Tabs
                    tabs={fundTabs}
                    activeTab={fundHighlightedTab}
                    onTabChange={handleFundTabChange}
                    variant="primary"
                    className="!border-b-0 h-full"
                  />
                </div>
              </div>
            </div>
          )}

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

        {/* Content tabs — stacked below the title when the page tabs scroll out
            of view, for every width where they don't fit beside it. */}
        {isFundPage && (
          <div
            className="content-lg:!hidden overflow-hidden transition-all duration-300 ease-in-out border-b px-4 lg:px-8 -mt-2"
            style={{
              maxHeight: showTopBarFundTabs ? '62px' : '0px',
              opacity: showTopBarFundTabs ? 1 : 0,
              borderBottomColor: showTopBarFundTabs ? undefined : 'transparent',
            }}
          >
            {showTopBarFundTabs && (
              <Tabs
                tabs={fundTabs}
                activeTab={fundHighlightedTab}
                onTabChange={handleFundTabChange}
                variant="primary"
                className="!border-b-0"
              />
            )}
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
