'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  User,
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  Search as SearchIcon,
  Shield,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { SearchModal } from '@/components/Search/SearchModal';
import UserMenu from '@/components/menus/UserMenu';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { Icon } from '@/components/ui/icons';
import { Tooltip } from '@/components/ui/Tooltip';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';
import { calculateProfileCompletion } from '@/utils/profileCompletion';

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
    '/trending', // Home variants
    '/earn',
    '/fund/grants',
    '/fund/needs-funding', // Fundraises page
    '/journal',
    '/notebook',
    '/leaderboard',
  ];

  return rootNavigationPaths.includes(pathname);
};

// Function to get page info based on current route
const getPageInfo = (pathname: string): PageInfo | null => {
  // Homepage variants
  if (['/', '/following', '/latest', '/trending'].includes(pathname)) {
    return {
      title: 'Explore',
      subtitle: 'Discover trending research, earning, and funding opportunities',
      icon: <FontAwesomeIcon icon={faHouseLight} fontSize={20} color="#000" />,
    };
  }

  // Specific routes with titles
  if (pathname === '/notifications') {
    return {
      title: 'Notifications',
      subtitle: 'Stay updated with your latest activity',
      icon: <Icon name="notification" size={20} className="text-primary-600" />,
    };
  }

  if (pathname === '/researchcoin') {
    return {
      title: 'My ResearchCoin',
      subtitle: 'Manage your RSC wallet and transactions',
      icon: <ResearchCoinIcon outlined size={24} color="#000" />,
    };
  }

  if (pathname.startsWith('/paper/create')) {
    return {
      title: 'Submit your paper',
      subtitle: 'Share your research with the community',
      icon: <Icon name="submit2" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/bounty/create')) {
    return {
      title: 'Create Bounty',
      subtitle: 'Incentivize the research economy',
      icon: <Icon name="earn1" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/bounties')) {
    return {
      title: 'Bounties',
      subtitle: 'Find opportunities to earn ResearchCoin',
      icon: <Icon name="earn1" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/earn')) {
    return {
      title: 'Earn',
      subtitle: 'Find opportunities to earn ResearchCoin',
      icon: <Icon name="earn1" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/funding')) {
    return {
      title: 'Funding',
      subtitle: 'Browse funding opportunities and grants',
      icon: <Icon name="fund" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/journal')) {
    return {
      title: 'RH Journal',
      subtitle: 'Read and publish peer-reviewed research',
      icon: <Icon name="rhJournal2" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/leaderboard')) {
    return {
      title: 'Leaderboard',
      subtitle: 'See top contributors in the ResearchHub community',
      icon: <ChartNoAxesColumnIncreasing size={20} color="#404040" strokeWidth={2} />,
    };
  }

  if (pathname.startsWith('/moderators')) {
    return {
      title: 'Moderation Dashboard',
      subtitle: 'Review and moderate community content',
      icon: <Shield size={20} className="text-primary-600" />,
    };
  }

  // Specific funding routes
  if (pathname === '/fund/needs-funding') {
    return {
      title: 'Research proposals',
      subtitle: 'Support research projects seeking funding',
      icon: <Icon name="createBounty" size={20} className="text-primary-600" />,
    };
  }

  // Grant routes
  if (pathname.startsWith('/fund/grants')) {
    return {
      title: 'Funding opportunities',
      subtitle: 'Explore available funding opportunities',
      icon: <Icon name="fund" size={20} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/fund/')) {
    return {
      title: 'Funding',
      subtitle: 'Fund breakthrough research shaping tomorrow',
      icon: <Icon name="fund" size={20} className="text-primary-600" />,
    };
  }

  // Grant routes
  if (pathname.startsWith('/grant')) {
    return {
      title: 'Grant',
      icon: <Icon name="fund" size={20} className="text-primary-600" />,
    };
  }

  // Dynamic routes with specific titles
  if (pathname.startsWith('/paper/')) {
    return {
      title: 'Paper',
      icon: <Icon name="workType" size={16} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/post/')) {
    return {
      title: 'Paper',
      icon: <Icon name="workType" size={16} className="text-primary-600" />,
    };
  }

  if (pathname.startsWith('/author/')) {
    return {
      title: 'Profile',
      icon: <Icon name="profile" size={20} className="text-primary-600" />,
    };
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

    const specialRoutes = ['/fund/', '/post/', '/paper/', '/author/'];
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

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { unreadCount } = useNotifications();
  const goBack = useSmartBack();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [shortcutText, setShortcutText] = useState('Ctrl+K');

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

  const renderSearchbarButton = () => {
    return (
      <div className="relative">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center w-full md:!w-80 max-w-md mx-auto h-10 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors text-left group"
        >
          <SearchIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
          <span className="text-gray-500 text-sm flex-1">
            <span className="tablet:!hidden">Search...</span>
            <span className="hidden tablet:!inline">Search ResearchHub...</span>
          </span>
          <div className="hidden md:!flex items-center space-x-1 ml-2 flex-shrink-0">
            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded font-medium">
              {shortcutText}
            </span>
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="h-[64px] border-b border-gray-200 bg-white">
        <div className="h-full flex items-center justify-between px-4 lg:px-8">
          {/* Left side - Mobile hamburger + Back button + Page title */}
          <div className="flex items-center">
            {/* Mobile hamburger menu */}
            <div className="block tablet:!hidden mr-2">
              <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Back button - show when we have page info but not for root navigation pages */}
            {pageInfo && !isRootNavigationPage(pathname) && (
              <div className="hidden tablet:!block mr-3">
                <button
                  onClick={goBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            )}

            {/* Page title - only on desktop */}
            {pageInfo && (
              <div className="hidden tablet:!block">
                <div className="flex items-center">
                  {pageInfo.icon && <div className="mr-3">{pageInfo.icon}</div>}
                  {pageInfo.title && (
                    <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                      {pageInfo.title}
                    </h1>
                  )}
                </div>
                {pageInfo.subtitle && (
                  <p className="text-sm text-gray-600 leading-tight mt-1">{pageInfo.subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Center - Search input (mobile only) */}
          <div className="flex-1 flex justify-center px-4 tablet:!hidden">
            <div className="w-full">{renderSearchbarButton()}</div>
          </div>

          {/* Right side - User controls */}
          <div className="flex items-center space-x-2">
            {/* Desktop user controls */}
            <div className="hidden tablet:!flex items-center space-x-3">
              {/* Search bar */}
              {renderSearchbarButton()}

              {user && (
                <>
                  {/* Wallet icon */}
                  <Tooltip content="Your ResearchCoin Wallet" position="bottom">
                    <Link href="/researchcoin" className="flex items-center">
                      <div className="flex items-center justify-center p-2.5 hover:bg-gray-100 rounded-md transition-colors">
                        <ResearchCoinIcon outlined color="#676767" size={24} />
                      </div>
                    </Link>
                  </Tooltip>

                  {/* Notification icon */}
                  <Tooltip content="Notifications" position="bottom">
                    <Link href="/notifications" className="flex items-center">
                      <div className="flex items-center justify-center p-2.5 hover:bg-gray-100 rounded-md transition-colors relative">
                        <Icon name="notification" size={24} className="text-gray-500" />
                        {unreadCount > 0 && (
                          <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-primary-600 text-white flex items-center justify-center">
                            <span className="font-medium text-[9px]">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </Tooltip>
                </>
              )}

              {/* Avatar/Login */}
              {user && !isLoading ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={32}
                  percent={calculatePercent()}
                />
              ) : (
                <Button
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-gray-200 p-0"
                  onClick={() => executeAuthenticatedAction(() => router.push('/'))}
                >
                  <User size={24} />
                </Button>
              )}
            </div>

            {/* Mobile user controls (original) */}
            <div className="flex tablet:!hidden">
              {user && !isLoading ? (
                <UserMenu
                  user={user}
                  onViewProfile={handleViewProfile}
                  avatarSize={calculatePercent() === 100 ? 40 : 30}
                  percent={calculatePercent()}
                />
              ) : (
                <Button
                  variant="ghost"
                  className="w-10 h-10 rounded-full bg-gray-200 p-0"
                  onClick={() => executeAuthenticatedAction(() => router.push('/'))}
                >
                  <User size={24} />
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
};
