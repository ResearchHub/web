'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';
import { faEllipsis, faGrid3 as faGrid3Light } from '@fortawesome/pro-light-svg-icons';
import { faGrid3 as faGrid3Solid } from '@fortawesome/pro-solid-svg-icons';
import { faXTwitter, faDiscord, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { Icon } from '@/components/ui/icons';
import { IconName } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { useUser } from '@/contexts/UserContext';

interface NavItem {
  label: string;
  href?: string;
  iconKey?: string;
  isMore?: boolean;
  requiresAuth?: boolean;
  isDynamicHome?: boolean;
}

// Additional navigation items not in the bottom bar
const moreNavItems: NavItem[] = [
  { label: 'RH Journal', href: '/journal', iconKey: 'journal' },
  { label: 'Browse', href: '/browse', iconKey: 'browse' },
  { label: 'Notebook', href: '/notebook', iconKey: 'notebook', requiresAuth: true },
  { label: 'Leaderboard', href: '/leaderboard', iconKey: 'leaderboard' },
];

// Check if a path is active
const isPathActive = (path: string, currentPath: string): boolean => {
  if (path === '/for-you' || path === '/popular') {
    return ['/popular', '/for-you', '/latest', '/following', '/'].includes(currentPath);
  }
  if (path === '/fund/grants') {
    return ['/fund/grants', '/fund/needs-funding', '/fund/previously-funded'].includes(currentPath);
  }
  if (path === '/notebook') {
    return currentPath.startsWith('/notebook');
  }
  if (path === '/leaderboard') {
    return currentPath.startsWith('/leaderboard');
  }
  if (path === '/browse') {
    return currentPath.startsWith('/browse');
  }
  if (path === '/journal') {
    return currentPath.startsWith('/journal');
  }
  return path === currentPath;
};

export const MobileBottomNav: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname() || '';
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { showUSD, toggleCurrency } = useCurrencyPreference();
  const scrollContainerRef = useScrollContainer();
  const { user } = useUser();

  // Home href depends on auth state: logged in -> /for-you, logged out -> /popular
  const homeHref = user ? '/for-you' : '/popular';

  const mainNavItems: NavItem[] = [
    { label: 'Home', href: homeHref, iconKey: 'home', isDynamicHome: true },
    { label: 'Earn', href: '/earn', iconKey: 'earn' },
    { label: 'Fund', href: '/fund/grants', iconKey: 'fund' },
    { label: 'Wallet', href: '/researchcoin', iconKey: 'wallet' },
    { label: 'More', isMore: true, iconKey: 'more' },
  ];

  // Track scroll direction using the scroll container from context
  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current;

    const handleScroll = () => {
      const currentScrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      const scrollThreshold = 10; // Minimum scroll amount to trigger change

      if (Math.abs(currentScrollY - lastScrollY.current) < scrollThreshold) {
        return;
      }

      setIsScrollingDown(currentScrollY > lastScrollY.current && currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    const target = scrollContainer || window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  const handleNavClick = (item: NavItem) => {
    if (item.isMore) {
      setIsMoreOpen(true);
      return;
    }

    if (item.requiresAuth) {
      executeAuthenticatedAction(() => router.push(item.href!));
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleMoreItemClick = (item: NavItem) => {
    setIsMoreOpen(false);
    if (item.requiresAuth) {
      executeAuthenticatedAction(() => router.push(item.href!));
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const renderIcon = (item: NavItem, isActive: boolean) => {
    const iconColor = isActive ? '#3971ff' : '#000000';
    const iconSize = 24;

    switch (item.iconKey) {
      case 'home':
        return (
          <FontAwesomeIcon
            icon={isActive ? faHouseSolid : faHouseLight}
            fontSize={iconSize}
            color={iconColor}
          />
        );
      case 'earn':
        return (
          <Icon
            name={isActive ? 'solidEarn' : ('earn1' as IconName)}
            size={iconSize}
            color={iconColor}
          />
        );
      case 'fund':
        return (
          <Icon
            name={isActive ? 'solidHand' : ('fund' as IconName)}
            size={iconSize}
            color={iconColor}
          />
        );
      case 'wallet':
        return <ResearchCoinIcon outlined={!isActive} className="h-6 w-6" color={iconColor} />;
      case 'more':
        return <FontAwesomeIcon icon={faEllipsis} fontSize={iconSize} color={iconColor} />;
      case 'journal':
        return (
          <Icon
            name={isActive ? 'rhJournal2' : ('rhJournal1' as IconName)}
            size={iconSize}
            color={iconColor}
          />
        );
      case 'browse':
        return (
          <FontAwesomeIcon
            icon={isActive ? faGrid3Solid : faGrid3Light}
            fontSize={iconSize}
            color={iconColor}
          />
        );
      case 'notebook':
        return (
          <Icon
            name={isActive ? 'notebookBold' : ('labNotebook2' as IconName)}
            size={iconSize}
            color={iconColor}
          />
        );
      case 'leaderboard':
        return (
          <ChartNoAxesColumnIncreasing
            size={iconSize}
            color={iconColor}
            strokeWidth={isActive ? 2.5 : 2}
          />
        );
      default:
        return null;
    }
  };

  // Check if any "More" menu item is active
  const isMoreActive = moreNavItems.some((item) => item.href && isPathActive(item.href, pathname));

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 tablet:!hidden transition-all duration-300 ease-in-out ${
          isScrollingDown
            ? 'opacity-20 shadow-none'
            : 'opacity-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
        }`}
        style={{ backgroundColor: isScrollingDown ? 'rgba(255, 255, 255, 0.3)' : 'white' }}
      >
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {mainNavItems.map((item) => {
            const isActive = item.isMore
              ? isMoreActive || isMoreOpen
              : item.href
                ? isPathActive(item.href, pathname)
                : false;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors"
              >
                <div className="flex items-center justify-center h-7 w-7">
                  {renderIcon(item, isActive)}
                </div>
                <span
                  className={`text-[11px] mt-1 font-medium ${
                    isActive ? 'text-primary-600' : 'text-black'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Menu Drawer */}
      <SwipeableDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        height="auto"
        showCloseButton={true}
      >
        <div className="pb-6">
          {/* Title */}
          <div className="px-4 pb-4 border-b border-gray-200 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">More</h2>
          </div>

          {/* Primary Navigation Links */}
          <div className="space-y-1 mb-6">
            {moreNavItems.map((item) => {
              const isActive = item.href ? isPathActive(item.href, pathname) : false;

              return (
                <button
                  key={item.label}
                  onClick={() => handleMoreItemClick(item)}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center h-6 w-6 mr-3">
                    {renderIcon(item, isActive)}
                  </div>
                  <span className={`text-[15px] font-medium ${isActive ? 'text-primary-600' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4" />

          {/* Footer Links Section */}
          <div className="px-4">
            {/* Social Icons & Currency Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/researchhub"
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
                </a>
                <a
                  href="https://discord.com/invite/ZcCYgcnUp5"
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/ResearchHub"
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/researchhubtechnologies"
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                </a>
              </div>
              {/* Currency Toggle */}
              <select
                value={showUSD ? 'USD' : 'RSC'}
                onChange={() => toggleCurrency()}
                className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="RSC">RSC</option>
                <option value="USD">USD</option>
              </select>
            </div>

            {/* Utility Links */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <a href="https://www.researchhub.com/about/tos" className="hover:text-gray-700">
                Terms
              </a>
              <a href="https://www.researchhub.com/about/privacy" className="hover:text-gray-700">
                Privacy
              </a>
              <a
                href="https://github.com/ResearchHub/issues/issues/new/choose"
                className="hover:text-gray-700"
              >
                Issues
              </a>
              <a href="https://docs.researchhub.com/" className="hover:text-gray-700">
                Docs
              </a>
              <a
                href="https://airtable.com/appuhMJaf1kb3ic8e/pagYeh6cB9sgiTIgx/form"
                className="hover:text-gray-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>
              <a href="https://researchhub.foundation/" className="hover:text-gray-700">
                Foundation
              </a>
              <a href="https://www.researchhub.com/about" className="hover:text-gray-700">
                About
              </a>
            </div>
          </div>
        </div>
      </SwipeableDrawer>
    </>
  );
};

export default MobileBottomNav;
