'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { SearchModal } from '@/components/Search/SearchModal';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { Logo } from '@/components/ui/Logo';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FundingGrantTabs } from '@/components/Funding/FundingGrantTabs';
import { useGrants } from '@/contexts/GrantContext';
import { useFeedTabsVisibility } from '@/contexts/FeedTabsVisibilityContext';
import { useSmartBack } from '@/hooks/useSmartBack';
import { FeedGrantContent } from '@/types/feed';

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
  const searchParams = useSearchParams();
  const { unreadCount } = useNotifications();
  const goBack = useSmartBack();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [shortcutText, setShortcutText] = useState('Ctrl+K');
  const { showAuthModal } = useAuthModalContext();

  const { tabs, activeTab, highlightedTab, handleTabChange, isFeedPage } = useFeedTabs();
  const { grants, contentTabsHidden } = useGrants();
  const { contentTabsHidden: feedTabsHidden } = useFeedTabsVisibility();
  const showTopBarFeedTabs = isFeedPage && feedTabsHidden;

  const isFundingPage =
    pathname === '/fund' || pathname === '/fund/browse' || pathname.startsWith('/fund/grant/');
  const isProposalPage = pathname.startsWith('/proposal/');
  const isGrantPage = pathname.startsWith('/grant/');
  const showGrantTabs = (isFundingPage || isProposalPage || isGrantPage) && grants.length > 0;
  const showTopBarGrantTabs = showGrantTabs && contentTabsHidden;

  const activeGrantTitle = useMemo(() => {
    const match = pathname.match(/^\/(?:fund\/)?grant\/(\d+)/);
    if (!match) return null;
    const postId = Number(match[1]);
    const grant = grants.find((g) => {
      const content = g.content as FeedGrantContent;
      return content.id === postId;
    });
    if (!grant) return null;
    return (grant.content as FeedGrantContent).grant.shortTitle;
  }, [pathname, grants]);

  const currentSearchQuery = pathname === '/search' ? searchParams.get('q') : null;
  const pageInfo = getPageInfo(pathname, searchParams);
  const showBackButton = pageInfo && !isRootNavigationPage(pathname);

  const breadcrumbParent = pageInfo?.breadcrumbParent ?? null;
  const breadcrumbChild = activeGrantTitle ?? (breadcrumbParent ? (pageInfo?.title ?? null) : null);
  const breadcrumbParentTitle = activeGrantTitle
    ? (pageInfo?.title ?? null)
    : (breadcrumbParent?.title ?? null);
  const breadcrumbParentHref = breadcrumbParent?.href ?? null;

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

  useEffect(() => {
    const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
    setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  const handleViewProfile = () => {
    if (user?.authorProfile?.profileUrl) {
      router.push(user.authorProfile.profileUrl);
    }
  };

  const openSearch = () => setIsSearchModalOpen(true);

  return (
    <>
      <div
        className={`bg-white ${showTopBarFeedTabs || showGrantTabs || showTopBarGrantTabs ? 'tablet:!border-b tablet:!border-gray-200' : 'border-b border-gray-200'}`}
      >
        {/* Title row */}
        <div className="flex items-center justify-between px-4 lg:px-8" style={{ height: '70px' }}>
          {/* Left side */}
          <div className="flex items-center min-w-0 flex-1 mr-4 h-full">
            <Link href="/" className="block tablet:!hidden mr-2">
              <div className="rounded-full bg-gray-100 flex items-center justify-center w-11 h-11">
                <Logo noText size={36} className="mt-[-2px]" />
              </div>
            </Link>

            {showBackButton && <TopBarBackButton onClick={goBack} variant="mobile" />}

            {pageInfo && (
              <TopBarBreadcrumb
                pageInfo={pageInfo}
                breadcrumbChild={breadcrumbChild}
                breadcrumbParentTitle={breadcrumbParentTitle}
                breadcrumbParentHref={breadcrumbParentHref}
                variant="mobile"
              />
            )}

            {showBackButton && <TopBarBackButton onClick={goBack} variant="desktop" />}

            {pageInfo && (
              <TopBarBreadcrumb
                pageInfo={pageInfo}
                breadcrumbChild={breadcrumbChild}
                breadcrumbParentTitle={breadcrumbParentTitle}
                breadcrumbParentHref={breadcrumbParentHref}
                variant="desktop"
              />
            )}

            {/* Inline feed tabs — desktop only, shown to the right of the title */}
            {showTopBarFeedTabs && (
              <div className="hidden tablet:!flex items-center ml-4 h-full mt-6">
                <FeedTabs
                  activeTab={highlightedTab}
                  tabs={tabs}
                  onTabChange={handleTabChange}
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
              avatarSize={32}
              profilePercent={profilePercent()}
              onViewProfile={handleViewProfile}
              onAuth={showAuthModal}
              onSearchOpen={openSearch}
              currentSearchQuery={currentSearchQuery}
              shortcutText={shortcutText}
              variant="desktop"
            />

            <TopBarUserControls
              user={user}
              isLoading={isLoading}
              unreadCount={unreadCount}
              avatarSize={40}
              profilePercent={profilePercent()}
              onViewProfile={handleViewProfile}
              onAuth={showAuthModal}
              onSearchOpen={openSearch}
              currentSearchQuery={currentSearchQuery}
              shortcutText={shortcutText}
              variant="mobile"
            />
          </div>
        </div>

        {/* Feed tabs — mobile only, stacked below title when content tabs scroll out of view */}
        {isFeedPage && (
          <div
            className="tablet:!hidden overflow-hidden transition-all duration-300 ease-in-out border-b px-4 -mt-2 pb-1"
            style={{
              maxHeight: showTopBarFeedTabs ? '62px' : '0px',
              opacity: showTopBarFeedTabs ? 1 : 0,
              borderBottomColor: showTopBarFeedTabs ? undefined : 'transparent',
            }}
          >
            <FeedTabs
              activeTab={highlightedTab}
              tabs={tabs}
              onTabChange={handleTabChange}
              isCompact={false}
            />
          </div>
        )}

        {/* Funding grant tabs — revealed when content tabs scroll out of view */}
        {(isFundingPage || isProposalPage || isGrantPage) && (
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out border-b px-4 lg:px-8 -mt-2 pb-1"
            style={{
              maxHeight: showTopBarGrantTabs ? '62px' : '0px',
              opacity: showTopBarGrantTabs ? 1 : 0,
              borderBottomColor: showTopBarGrantTabs ? undefined : 'transparent',
            }}
          >
            <FundingGrantTabs variant="topbar" />
          </div>
        )}
      </div>

      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
