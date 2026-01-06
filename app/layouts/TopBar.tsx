'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  ArrowLeft,
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
import { calculateProfileCompletion } from '@/utils/profileCompletion';
import { getTopicEmoji } from '@/components/Topic/TopicEmojis';
import { toTitleCase } from '@/utils/stringUtils';
import { Hash } from 'lucide-react';
import { getSourceLogo, getPreprintDisplayName } from '@/utils/preprintUtil';
import { Logo } from '@/components/ui/Logo';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useFeedTabs } from '@/hooks/useFeedTabs';
import { FeedTab } from '@/hooks/useFeed';

interface TopBarProps {
  onMenuClick: () => void;
}

interface PageInfo {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

// Function to check if a pathname is a root navigation page (that shouldn't have back button)
const isRootNavigationPage = (pathname: string): boolean => {
  const rootNavigationPaths = [
    '/',
    '/following',
    '/latest',
    '/popular', // Home variants
    '/for-you',
    '/feed',
    '/earn',
    '/fund',
    '/fund/grants',
    '/fund/needs-funding', // Fundraises page
    '/journal',
    '/notebook',
    '/browse',
    '/leaderboard',
    '/lists',
  ];

  return rootNavigationPaths.includes(pathname);
};

// Function to get page info based on current route
const getPageInfo = (pathname: string): PageInfo | null => {
  // Homepage variants
  if (['/', '/following', '/latest', '/popular', '/for-you', '/feed'].includes(pathname)) {
    return {
      title: 'Home',
      subtitle: 'Explore cutting-edge research from leading preprint servers.',
      icon: <FontAwesomeIcon icon={faHouseLight} fontSize={24} color="#000" />,
    };
  }

  // Browse page
  if (pathname === '/browse') {
    return {
      title: 'Browse',
      subtitle: 'Discover and follow research topics',
      icon: <FontAwesomeIcon icon={faGrid3Light} fontSize={24} color="#000" />,
    };
  }

  // Search page
  if (pathname === '/search') {
    return {
      title: 'Search',
      subtitle: 'Find papers, grants, authors, and peer reviews',
      icon: <FontAwesomeIcon icon={faMagnifyingGlass} fontSize={24} color="#000" />,
    };
  }

  // Specific routes with titles
  if (pathname === '/notifications') {
    return {
      title: 'Notifications',
      subtitle: 'Stay updated with your latest activity',
      icon: <Icon name="notification" size={24} className="text-gray-900" />,
    };
  }

  if (pathname === '/researchcoin') {
    return {
      title: 'My Wallet',
      subtitle: 'Manage your wallet and view transactions',
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
      subtitle: 'Submit your original work as a preprint or publication',
      icon: <Icon name="submit2" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/bounty/create')) {
    return {
      title: 'Create Bounty',
      subtitle: 'Incentivize the research economy',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/bounties')) {
    return {
      title: 'Bounties',
      subtitle: 'Earn RSC for completing peer reviews',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/earn')) {
    return {
      title: 'Earn ResearchCoin',
      subtitle: 'Earn RSC for completing peer reviews',
      icon: <Icon name="earn1" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/funding')) {
    return {
      title: 'Funding',
      subtitle: 'Browse funding opportunities and grants',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/journal')) {
    return {
      title: 'RH Journal',
      subtitle: 'Read and publish peer-reviewed research',
      icon: <Icon name="rhJournal2" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/leaderboard')) {
    return {
      title: 'Leaderboard',
      subtitle: 'See top contributors in the ResearchHub community',
      icon: <ChartNoAxesColumnIncreasing size={24} color="#404040" strokeWidth={2} />,
    };
  }

  if (pathname.startsWith('/moderators')) {
    return {
      title: 'Moderation Dashboard',
      subtitle: 'Review and moderate community content',
      icon: <Shield size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/fund/grants')) {
    return {
      title: 'Request for Proposals',
      subtitle: 'Explore available funding opportunities',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  if (pathname === '/fund/needs-funding') {
    return {
      title: 'Research Proposals',
      subtitle: 'Support research projects seeking funding',
      icon: <Icon name="createBounty" size={24} className="text-gray-900" />,
    };
  }

  if (pathname.startsWith('/fund')) {
    return {
      title: 'Funding',
      subtitle: 'Fund breakthrough research shaping tomorrow',
      icon: <Icon name="fund" size={24} className="text-gray-900" />,
    };
  }

  // Grant routes
  if (pathname.startsWith('/grant')) {
    return {
      title: 'RFP',
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
        // Use preprint server logo only (no title)
        return {
          title: '',
          subtitle: 'Explore research from this preprint server',
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
        subtitle: 'Explore research in this topic',
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
    // Store the previous route for smart back navigation
    const handleRouteChange = (url: string) => {
      const currentPathBase = pathname.split('/').slice(0, 3).join('/');
      const newPathBase = url.split('/').slice(0, 3).join('/');

      // Only update if it's a different base route
      if (currentPathBase !== newPathBase) {
        setPreviousRoute(pathname);
      }
    };

    // Listen for route changes
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
    // If no history exists, always go to homepage
    if (window.history.length <= 1) {
      router.push('/');
      return;
    }

    const specialRoutes = ['/fund/', '/post/', '/paper/', '/author/', '/question/'];
    const isSpecialRoute = specialRoutes.some((route) => pathname.startsWith(route));

    if (isSpecialRoute) {
      // For special routes, try to go back, with fallback to home
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

  const scrollContainerRef = useScrollContainer();
  const [showFeedTabs, setShowFeedTabs] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const { tabs, activeTab, handleTabChange, isFeedPage } = useFeedTabs();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef?.current) {
        const scrolled = scrollContainerRef.current.scrollTop > 100;
        setShowFeedTabs(scrolled);
        setIsCompact(scrolled);
      }
    };

    const container = scrollContainerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [scrollContainerRef]);

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
    const displayText = currentSearchQuery || 'Search...';
    const displayTextTablet = currentSearchQuery || 'Search ResearchHub...';

    return (
      <div className="relative">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center w-full md:!w-80 max-w-md mx-auto h-8 px-4 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-left group"
        >
          <SearchIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
          <span
            className={`text-sm flex-1 truncate ${currentSearchQuery ? 'text-gray-900' : 'text-gray-500'}`}
          >
            <span className="tablet:!hidden">{displayText}</span>
            <span className="hidden tablet:!inline">{displayTextTablet}</span>
          </span>
          <div className="hidden md:!flex items-center space-x-1 ml-2 flex-shrink-0">
            <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-medium">
              {shortcutText}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className={`border-b border-gray-200 bg-white transition-all duration-150 ${
          isCompact ? 'h-[48px]' : 'h-[64px]'
        }`}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-8">
          {/* Left side - Back button + Page title OR FeedTabs */}
          <div className="flex items-center min-w-0 flex-1 mr-4 h-full">
            {showFeedTabs && isFeedPage ? (
              <div className="flex items-center w-full max-w-md h-full gap-4">
                {pageInfo?.icon && (
                  <div
                    className={`${
                      pageInfo.title ? 'hidden tablet:!block' : 'block'
                    } flex-shrink-0 opacity-80 scale-90`}
                  >
                    {pageInfo.icon}
                  </div>
                )}
                <div className="flex-1 h-full min-w-0">
                  <FeedTabs
                    activeTab={activeTab}
                    tabs={tabs}
                    onTabChange={handleTabChange}
                    isCompact={isCompact}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Mobile logo - leftmost position */}
                <Link href="/" className="block tablet:!hidden mr-2">
                  <div
                    className={`rounded-full bg-gray-100 flex items-center justify-center transition-all ${
                      isCompact ? 'w-8 h-8' : 'w-11 h-11'
                    }`}
                  >
                    <Logo noText size={isCompact ? 28 : 36} className="mt-[-2px]" />
                  </div>
                </Link>

                {/* Mobile back button - show when not on root navigation pages */}
                {pageInfo && !isRootNavigationPage(pathname) && (
                  <div className="block tablet:!hidden mr-1">
                    <button
                      onClick={goBack}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className={`text-gray-600 ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    </button>
                  </div>
                )}

                {/* Mobile page title - next to hamburger/back button */}
                {pageInfo && (
                  <div className="flex tablet:!hidden items-center min-w-0">
                    <div>
                      {pageInfo.title ? (
                        <h1
                          className={`font-bold text-gray-900 leading-tight truncate transition-all ${
                            isCompact ? 'text-md' : 'text-lg'
                          }`}
                        >
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
                  <div className="hidden tablet:!block mr-3">
                    <button
                      onClick={goBack}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className={`text-gray-600 ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
                    </button>
                  </div>
                )}

                {/* Page title - only on desktop */}
                {pageInfo && (
                  <div className="hidden tablet:!flex items-center min-w-0">
                    {pageInfo.icon && (
                      <div className={`mr-3 flex-shrink-0 transition-all`}>{pageInfo.icon}</div>
                    )}
                    <div className="min-w-0">
                      {pageInfo.title && (
                        <h1
                          className={`font-bold text-gray-900 leading-tight truncate transition-all ${
                            isCompact ? 'text-lg' : 'text-xl'
                          }`}
                        >
                          {pageInfo.title}
                        </h1>
                      )}
                      {pageInfo.subtitle && !isCompact && (
                        <p className="hidden wide:!block text-md text-gray-600 leading-tight mt-0.5">
                          {pageInfo.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
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
                    <div
                      className={`flex items-center justify-center hover:bg-gray-100 rounded-md transition-all ${
                        isCompact ? 'p-1.5' : 'p-2'
                      }`}
                    >
                      <Icon
                        name="rscThin"
                        size={isCompact ? 24 : 28}
                        className="text-gray-500 transition-all"
                      />
                    </div>
                  </Link>

                  <Link href="/notifications" className="flex items-center">
                    <div
                      className={`flex items-center justify-center hover:bg-gray-100 rounded-md transition-all relative ${
                        isCompact ? 'p-1.5' : 'p-2'
                      }`}
                    >
                      <Icon
                        name="notification"
                        size={isCompact ? 24 : 28}
                        className="text-gray-500 transition-all"
                      />
                      {unreadCount > 0 && (
                        <div
                          className={`absolute rounded-full bg-primary-600 text-white flex items-center justify-center transition-all ${
                            isCompact ? 'top-0.5 -right-0 h-3.5 w-3.5' : 'top-1 -right-0 h-4 w-4'
                          }`}
                        >
                          <span
                            className={`font-medium transition-all ${
                              isCompact ? 'text-[8px]' : 'text-[9px]'
                            }`}
                          >
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
                  <div
                    className={`bg-gray-300 rounded-full animate-pulse transition-all ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  ></div>
                </div>
              ) : user ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={isCompact ? 28 : 32}
                  percent={calculatePercent()}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size={isCompact ? 'sm' : 'md'}
                    onClick={handleLogin}
                    className="text-gray-700 hover:text-gray-900 whitespace-nowrap transition-all"
                  >
                    Log in
                  </Button>
                  <Button
                    variant="default"
                    size={isCompact ? 'sm' : 'md'}
                    onClick={handleSignUp}
                    className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap transition-all"
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
                className={`rounded-lg hover:bg-gray-100 transition-all ${
                  isCompact ? 'p-1' : 'p-2'
                }`}
              >
                <SearchIcon
                  className={`text-gray-600 transition-all ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}
                />
              </button>

              {isLoading ? (
                <div className="flex items-center">
                  <div
                    className={`bg-gray-300 rounded-full animate-pulse transition-all ${
                      isCompact ? 'w-8 h-8' : 'w-10 h-10'
                    }`}
                  ></div>
                </div>
              ) : user ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={isCompact ? (calculatePercent() === 100 ? 32 : 24) : 40}
                  percent={calculatePercent()}
                />
              ) : (
                <Button
                  variant="default"
                  size={isCompact ? 'sm' : 'md'}
                  onClick={handleSignUp}
                  className="bg-rhBlue-500 hover:bg-rhBlue-600 text-white whitespace-nowrap transition-all"
                >
                  Sign up
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
}
