'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  ChartNoAxesColumnIncreasing,
  Search as SearchIcon,
  Shield,
  MessageCircleQuestion,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SearchModal } from '@/components/Search/SearchModal';
import UserMenu from '@/components/menus/UserMenu';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Icon } from '@/components/ui/icons';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse as faHouseLight,
  faBookmark as faBookmarkLight,
  faCommentsQuestion,
  faGrid3 as faGrid3Light,
  faMagnifyingGlass,
} from '@fortawesome/pro-light-svg-icons';
import { faArrowLeftLong } from '@fortawesome/pro-solid-svg-icons';
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { getTopicEmoji } from '@/components/Topic/TopicEmojis';
import { toTitleCase } from '@/utils/stringUtils';
import { Hash } from 'lucide-react';
import { getSourceLogo, getPreprintDisplayName } from '@/utils/preprintUtil';
import { Logo } from '@/components/ui/Logo';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FundingGrantTabs } from '@/components/Funding/FundingGrantTabs';
import { useGrants } from '@/contexts/GrantContext';

interface TopBarProps {
  onMenuClick: () => void;
}

interface PageInfo {
  title: string;
  icon?: React.ReactNode;
}

// Function to check if a pathname is a root navigation page (that shouldn't have back button)
const ROOT_NAVIGATION_PATHS = new Set([
  '/',
  '/following',
  '/latest',
  '/popular',
  '/for-you',
  '/feed',
  '/earn',
  '/fund',
  '/fund/browse',
  '/dashboard',
  '/dashboard/impact',
  '/journal',
  '/notebook',
  '/browse',
  '/leaderboard',
  '/lists',
]);

const isRootNavigationPage = (pathname: string): boolean => ROOT_NAVIGATION_PATHS.has(pathname);

// Function to get page info based on current route
const getPageInfo = (pathname: string): PageInfo | null => {
  // Homepage variants
  if (['/', '/following', '/latest', '/popular', '/for-you', '/feed'].includes(pathname)) {
    return {
      title: 'Home',
      icon: <FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#000" />,
    };
  }

  // Browse page
  if (pathname === '/browse') {
    return {
      title: 'Browse',
      icon: <FontAwesomeIcon icon={faGrid3Light} fontSize={24} color="#000" />,
    };
  }

  // Search page
  if (pathname === '/search') {
    return {
      title: 'Search',
      icon: <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={24} color="#000" />,
    };
  }

  // Specific routes with titles
  if (pathname === '/notifications') {
    return {
      title: 'Notifications',
      icon: <Icon name="notification" size={24} className="text-gray-900" />,
    };
  }

  if (pathname === '/researchcoin') {
    return {
      title: 'My Wallet',
      icon: <Icon name="rscThin" size={28} />,
    };
  }

  if (pathname === '/lists' || pathname.startsWith('/list/')) {
    return {
      title: 'Your Lists',
      icon: <FontAwesomeIcon icon={faBookmarkLight} fontSize={24} color="#000" />,
    };
  }

  if (pathname.startsWith('/paper/create')) {
    return {
      title: 'Submit your paper',
      icon: <Icon name="submit2" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/bounty/create')) {
    return {
      title: 'Create Bounty',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/earn')) {
    return {
      title: 'Earn',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/journal')) {
    return {
      title: 'Journal',
      icon: <Icon name="rhJournal2" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/leaderboard')) {
    return {
      title: 'Leaderboard',
      icon: <ChartNoAxesColumnIncreasing size={24} color="#404040" strokeWidth={2} />,
    };
  }

  if (pathname.startsWith('/moderators')) {
    return {
      title: 'Moderation Dashboard',
      icon: <Shield size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/dashboard')) {
    return {
      title: 'My Dashboard',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  if (pathname === '/fund/browse' || pathname === '/fund') {
    return {
      title: 'Fund',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/proposal')) {
    return {
      title: 'Proposal',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/grant')) {
    return {
      title: 'Fund',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  // Dynamic routes with specific titles
  if (pathname.startsWith('/paper/')) {
    return {
      title: 'Paper',
      icon: <Icon name="workType" size={20} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/post/')) {
    return {
      title: 'Preprint',
      icon: <Icon name="preprint" size={20} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/question/')) {
    return {
      title: 'Question',
      icon: <FontAwesomeIcon icon={faCommentsQuestion} fontSize={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/author/')) {
    return {
      title: 'Profile',
      icon: <Icon name="profile" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/topic/')) {
    // Extract topic slug from URL
    const topicSlug = pathname.split('/topic/')[1]?.split('/')[0];
    if (topicSlug) {
      // Check if it's a preprint server
      const preprintLogo = getSourceLogo(topicSlug);

      if (preprintLogo && preprintLogo !== 'rhJournal2') {
        return {
          title: '',
          icon: (
            <Image
              src={preprintLogo}
              alt={getPreprintDisplayName(topicSlug)}
              width={80}
              height={24}
              className="object-contain"
              style={{ maxHeight: '24px' }}
            />
          ),
        };
      }

      // Get emoji for the topic
      const emoji = getTopicEmoji(topicSlug);
      // Convert slug to title case (replace hyphens with spaces)
      const topicName = toTitleCase(topicSlug.replace(/-/g, ' '));

      return {
        title: topicName,
        icon: emoji ? (
          <span className="text-2xl">{emoji}</span>
        ) : (
          <Hash className="w-6 h-6 text-gray-400" />
        ),
      };
    }
  }

  return null;
};

// Custom hook to handle back navigation with special logic
const useSmartBack = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const currentPathBase = pathname.split('/').slice(0, 3).join('/');
      const newPathBase = url.split('/').slice(0, 3).join('/');

      if (currentPathBase !== newPathBase) {
        setPreviousRoute(pathname);
      }
    };

    const originalPush = router.push;
    router.push = (...args) => {
      handleRouteChange(args[0].toString());
      return originalPush.apply(router, args);
    };

    return () => {
      router.push = originalPush;
    };
  }, [pathname, router]);

  const goBack = () => {
    if (window.history.length <= 1) {
      router.push('/');
      return;
    }

    const specialRoutes = ['/proposal/', '/grant/', '/post/', '/paper/', '/author/', '/question/'];
    const isSpecialRoute = specialRoutes.some((route) => pathname.startsWith(route));

    if (isSpecialRoute) {
      if (previousRoute && previousRoute !== pathname) {
        router.push(previousRoute);
      } else {
        router.back();
      }
    } else {
      router.back();
    }
  };

  return goBack;
};

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

  const { tabs, activeTab, highlightedTab, handleTabChange, isFeedPage, isTopicPage } =
    useFeedTabs();
  const { grants } = useGrants();

  const isFundingPage = pathname === '/fund' || pathname === '/fund/browse';
  const isProposalPage = pathname.startsWith('/proposal/');
  const isGrantPage = pathname.startsWith('/grant/');
  const showGrantTabs = (isFundingPage || isProposalPage || isGrantPage) && grants.length > 0;

  // Get current search query from URL if on search page
  const currentSearchQuery = pathname === '/search' ? searchParams.get('q') : null;

  const pageInfo = getPageInfo(pathname);

  const calculatePercent = useCallback(() => {
    if (user) {
      const { percent } = calculateProfileCompletion(user);

      return percent;
    }
    return 100;
  }, [user]);

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Detect OS for keyboard shortcut display
  useEffect(() => {
    const isMac = typeof window !== 'undefined' && /Mac/.test(navigator.platform);
    setShortcutText(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  const handleViewProfile = () => {
    if (user?.authorProfile?.profileUrl) {
      router.push(user.authorProfile.profileUrl);
    } else {
      console.warn('No author profile URL found for user:', user);
    }
  };

  const handleLogin = () => {
    showAuthModal();
  };

  const handleSignUp = () => {
    showAuthModal();
  };

  const renderSearchbarButton = () => {
    const displayText = currentSearchQuery || 'Search';
    const displayTextTablet = currentSearchQuery || 'Search';

    return (
      <div className="relative">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center w-full md:!w-60 max-w-md mx-auto h-9 px-4 py-1.5 bg-gray-100/75 hover:bg-gray-200 rounded-full transition-colors text-left group"
        >
          <SearchIcon className="h-4 w-4 text-gray-600 mr-3 flex-shrink-0" />
          <span
            className={`text-sm flex-1 truncate ${currentSearchQuery ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <span className="tablet:!hidden">{displayText}</span>
            <span className="hidden tablet:!inline">{displayTextTablet}</span>
          </span>
          <div className="hidden md:!flex items-center space-x-1 ml-2 flex-shrink-0">
            <span className="text-[12px] -mr-1 text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
              {shortcutText}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className={`bg-white ${isFeedPage || showGrantTabs ? '' : 'border-b border-gray-200'}`}>
        {/* Title row */}
        <div className="flex items-center justify-between px-4 lg:px-8" style={{ height: '70px' }}>
          {/* Left side - Back button + Page title OR FeedTabs */}
          <div className="flex items-center min-w-0 flex-1 mr-4 h-full">
            {/* Mobile logo - leftmost position */}
            <Link href="/" className="block tablet:!hidden mr-2">
              <div className="rounded-full bg-gray-100 flex items-center justify-center w-11 h-11">
                <Logo noText size={36} className="mt-[-2px]" />
              </div>
            </Link>

            {/* Mobile back button - show when not on root navigation pages */}
            {pageInfo && !isRootNavigationPage(pathname) && (
              <div className="block tablet:!hidden mr-1">
                <button
                  onClick={goBack}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowLeftLong} className="text-gray-700" fontSize={18} />
                </button>
              </div>
            )}

            {/* Mobile page title - next to hamburger/back button */}
            {pageInfo && (
              <div className="flex tablet:!hidden items-center min-w-0">
                <div>
                  {pageInfo.title ? (
                    <h1 className="font-semibold text-gray-900 leading-tight truncate text-lg">
                      {pageInfo.title}
                    </h1>
                  ) : (
                    pageInfo.icon && (
                      <div className="flex-shrink-0 opacity-90 scale-90 origin-left">
                        {pageInfo.icon}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Desktop back button - show when we have page info but not for root navigation pages */}
            {pageInfo && !isRootNavigationPage(pathname) && (
              <div className="hidden tablet:!block mr-1">
                <button
                  onClick={goBack}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faArrowLeftLong}
                    className="text-gray-700 mt-1"
                    fontSize={23}
                  />
                </button>
              </div>
            )}

            {/* Page title - only on desktop */}
            {pageInfo && (
              <div className="hidden tablet:!flex items-baseline min-w-0 flex-shrink-0">
                <div className="min-w-0">
                  {pageInfo.title && (
                    <h1
                      className="font-semibold text-gray-900 leading-tight truncate"
                      style={{ fontSize: '24px', letterSpacing: '-0.75px' }}
                    >
                      {pageInfo.title}
                    </h1>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-2 h-full">
            {/* Desktop user controls */}
            <div className="hidden tablet:!flex items-center space-x-2 h-full">
              {/* Search bar */}
              {renderSearchbarButton()}

              {user && (
                <>
                  <Link href="/researchcoin" className="flex items-center">
                    <div className="flex items-center justify-center hover:bg-gray-100 rounded-md p-2">
                      <Icon name="rscThin" size={28} className="text-gray-500" />
                    </div>
                  </Link>

                  <Link href="/notifications" className="flex items-center">
                    <div className="flex items-center justify-center hover:bg-gray-100 rounded-md p-2 relative">
                      <Icon name="notification" size={28} className="text-gray-500" />
                      {unreadCount > 0 && (
                        <div className="absolute rounded-full bg-primary-600 text-white flex items-center justify-center top-1 -right-0 h-4 w-4">
                          <span className="font-medium text-[9px]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                </>
              )}

              {/* Avatar/Login buttons */}
              {isLoading ? (
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full animate-pulse w-10 h-10"></div>
                </div>
              ) : user ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={32}
                  percent={calculatePercent()}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleLogin}
                    className="text-gray-700 hover:text-gray-900 whitespace-nowrap"
                  >
                    Log in
                  </Button>
                  <Button
                    variant="default"
                    size="md"
                    onClick={handleSignUp}
                    className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap"
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile user controls */}
            <div className="flex tablet:!hidden items-center space-x-1 h-full">
              {/* Mobile search icon */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="rounded-lg hover:bg-gray-100 p-2"
              >
                <SearchIcon className="text-gray-600 h-6 w-6" />
              </button>

              {isLoading ? (
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full animate-pulse w-10 h-10"></div>
                </div>
              ) : user ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={40}
                  percent={calculatePercent()}
                />
              ) : (
                <Button
                  variant="default"
                  size="md"
                  onClick={handleSignUp}
                  className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap"
                >
                  Sign up
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Feed tabs - second row below title */}
        {isFeedPage && (
          <div className="border-b border-gray-200 px-4 lg:px-8 -mt-2 pb-1">
            <FeedTabs
              activeTab={highlightedTab}
              tabs={tabs}
              onTabChange={handleTabChange}
              isCompact={false}
            />
          </div>
        )}

        {/* Funding grant tabs - second row below title */}
        {(isFundingPage || isProposalPage || isGrantPage) && (
          <div
            className="border-b border-gray-200 px-4 lg:px-8 overflow-hidden transition-all duration-300 ease-in-out -mt-2 pb-1"
            style={{
              maxHeight: showGrantTabs ? '62px' : '0px',
              opacity: showGrantTabs ? 1 : 0,
              borderBottomColor: showGrantTabs ? undefined : 'transparent',
            }}
          >
            <FundingGrantTabs />
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
