'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';
import { Star } from 'lucide-react';
import { Icon } from '@/components/ui/icons';
import { IconName } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { isHomeTabPath } from '@/hooks/useFundTabs';

interface NavItem {
  label: string;
  href: string;
  iconKey: 'home' | 'fund' | 'peer-review' | 'journal' | 'wallet';
  requiresAuth?: boolean;
  isHome?: boolean;
}

// Everything else (Endowment, help links) is in the top bar's hamburger menu,
// and Lists in the avatar menu.
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', iconKey: 'home', isHome: true },
  { label: 'My Funding', href: '/my-funding', iconKey: 'fund' },
  { label: 'Peer Review', href: '/peer-review', iconKey: 'peer-review' },
  { label: 'Journal', href: '/journal', iconKey: 'journal' },
  { label: 'Wallet', href: '/researchcoin', iconKey: 'wallet' },
];

const ICON_COLOR = '#111827';
const ICON_SIZE = 24;

const isPathActive = (item: NavItem, currentPath: string): boolean => {
  if (item.isHome) return isHomeTabPath(currentPath);
  if (item.iconKey === 'journal') return currentPath.startsWith('/journal');
  return item.href === currentPath;
};

/**
 * The Wallet item's label: the user's funding power once it is known (masked
 * if they have hidden it), so the balance is always one glance away.
 * "Wallet" when signed out or still loading.
 */
function useWalletLabel(): string {
  const { isReady, isSignedIn, total, format } = useFundingPower();
  const { isAmountHidden, isPrivacyReady } = useFundingPowerControls();

  if (!isReady || !isSignedIn || !isPrivacyReady) return 'Wallet';
  return isAmountHidden ? '••••' : format(total);
}

export const MobileBottomNav: React.FC = () => {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname() || '';
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const scrollContainerRef = useScrollContainer();
  const walletLabel = useWalletLabel();

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
    if (item.requiresAuth) {
      executeAuthenticatedAction(() => router.push(item.href));
    } else {
      router.push(item.href);
    }
  };

  const renderIcon = (item: NavItem, isActive: boolean) => {
    switch (item.iconKey) {
      case 'home':
        return (
          <FontAwesomeIcon
            icon={isActive ? faHouseSolid : faHouseLight}
            fontSize={ICON_SIZE}
            color={ICON_COLOR}
          />
        );
      case 'peer-review':
        return (
          <Star
            size={ICON_SIZE}
            color={ICON_COLOR}
            strokeWidth={isActive ? 2.25 : 2}
            fill={isActive ? ICON_COLOR : 'none'}
          />
        );
      case 'fund':
        return (
          <Icon
            name={isActive ? 'solidHand' : ('fund' as IconName)}
            size={ICON_SIZE}
            color={ICON_COLOR}
          />
        );
      case 'journal':
        return (
          <Icon
            name={isActive ? 'rhJournal2' : ('rhJournal1' as IconName)}
            size={ICON_SIZE}
            color={ICON_COLOR}
          />
        );
      case 'wallet':
        return (
          <ResearchCoinIcon
            outlined={!isActive}
            variant={isActive ? 'solid' : 'orange'}
            className="h-6 w-6"
            color={ICON_COLOR}
          />
        );
    }
  };

  return (
    // A shade grayer than the page so the nav reads as chrome, not content.
    <nav
      data-mobile-bottom-nav
      className={`fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-200 tablet:!hidden transition-all duration-300 ease-in-out ${
        isScrollingDown
          ? 'opacity-20 shadow-none'
          : 'opacity-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
      }`}
      style={{ backgroundColor: isScrollingDown ? 'rgba(249, 250, 251, 0.3)' : '#f9fafb' }}
    >
      <div className="flex items-center justify-around h-16 px-2 pb-safe">
        {NAV_ITEMS.map((item) => {
          const isActive = isPathActive(item, pathname);
          const label = item.iconKey === 'wallet' ? walletLabel : item.label;

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2"
            >
              {/* The selection: a bar riding on the nav's top border. */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute -top-px inset-x-4 h-[3px] rounded-b-full bg-gray-900"
                />
              )}
              <div className="flex items-center justify-center h-7 w-7">
                {renderIcon(item, isActive)}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium whitespace-nowrap text-gray-900 ${
                  item.iconKey === 'wallet' ? 'tabular-nums' : ''
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
