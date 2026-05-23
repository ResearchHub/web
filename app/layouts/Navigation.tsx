'use client';

import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse as faHouseSolid,
  faBookmark as faBookmarkSolid,
} from '@fortawesome/pro-solid-svg-icons';
import {
  faHouse as faHouseLight,
  faBookmark as faBookmarkLight,
} from '@fortawesome/pro-light-svg-icons';
import { Sprout } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { useUser } from '@/contexts/UserContext';

const ENDOWMENT_NAV_FEATURE = 'endowment_nav_new_badge';
// Stop showing the "New" badge on the Endowment nav item after this date,
// regardless of dismissal state. Using UTC to avoid timezone drift.
const ENDOWMENT_NEW_BADGE_CUTOFF = new Date(Date.UTC(2026, 7, 1));

// Define icon mapping for navigation items with both light and solid variants
interface NavIcon {
  light: IconName;
  solid: IconName;
}

type NavIconKey = 'earn' | 'fund' | 'journal' | 'notebook' | 'home';

interface NavigationItem {
  label: string;
  href: string;
  iconKey?: NavIconKey;
  description: string;
  requiresAuth?: boolean;
  isUnimplemented?: boolean;
  isFontAwesome?: boolean;
  isLucideSprout?: boolean;
  /** Show a "New" badge next to the label. Pair with `newFeatureName` so the
   *  badge is dismissed once the user clicks the item. */
  isNew?: boolean;
  /** Feature key passed to `useDismissableFeature` so the badge persists its
   *  dismissed state per-user. */
  newFeatureName?: string;
}

interface NavigationProps {
  currentPath: string;
  onUnimplementedFeature: (featureName: string) => void;
  forceMinimize?: boolean;
}

// Map navigation icons to their light and solid variants
const navIconMap: Record<NavIconKey, NavIcon> = {
  home: {
    light: 'home1',
    solid: 'home2',
  },
  earn: {
    light: 'earn1',
    solid: 'solidEarn',
  },
  fund: {
    light: 'fund',
    solid: 'solidHand',
  },
  journal: {
    light: 'rhJournal1',
    solid: 'rhJournal2',
  },
  notebook: {
    light: 'labNotebook2',
    solid: 'notebookBold',
  },
};

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onUnimplementedFeature,
  forceMinimize = false,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();
  const { user } = useUser();

  // Dismissable "New" badge for the Endowment nav item. Lifted to the parent
  // so the click handler in NavLink can call dismissFeature() without each
  // NavLink unconditionally calling the hook.
  const {
    isDismissed: isEndowmentBadgeDismissed,
    dismissFeature: dismissEndowmentBadge,
    dismissStatus: endowmentBadgeStatus,
  } = useDismissableFeature(ENDOWMENT_NAV_FEATURE);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  // Home href depends on auth state: logged in -> /for-you, logged out -> /popular
  const homeHref = user ? '/for-you' : '/popular';

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: homeHref,
      iconKey: 'home',
      isFontAwesome: true,
      description: 'Navigate to the home page',
    },
    {
      label: 'Fund',
      href: '/fund',
      iconKey: 'fund',
      description: 'Browse grants and fundraising opportunities',
    },
    {
      label: 'Earn',
      href: '/earn',
      iconKey: 'earn',
      description: 'Earn RSC for completing peer reviews',
    },
    {
      label: 'Journal',
      href: '/journal',
      iconKey: 'journal',
      description: 'Read and publish research papers',
    },
    {
      label: 'Notebook',
      href: '/notebook',
      iconKey: 'notebook',
      description: 'Access your research notes',
      requiresAuth: true,
    },
    {
      label: 'Lists',
      href: '/lists',
      isFontAwesome: true,
      description: 'View and manage your saved lists',
      requiresAuth: true,
    },
    {
      label: 'Endowment',
      href: '/endowment',
      isLucideSprout: true,
      isNew: true,
      newFeatureName: ENDOWMENT_NAV_FEATURE,
      description: 'Earn Funding Credits on your RSC deposits',
    },
  ];

  const getButtonStyles = (path: string, currentPath: string) => {
    const isActive = isPathActive(path);

    // Use either responsive or force minimized classes
    const responsiveClasses = forceMinimize
      ? '!px-2 !justify-center'
      : 'tablet:max-sidebar-compact:!px-2 tablet:max-sidebar-compact:!justify-center';

    return isActive
      ? `flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-primary-600 ${responsiveClasses} bg-primary-50 rounded-lg group`
      : `flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-gray-700 ${responsiveClasses} hover:bg-gray-50 rounded-lg group`;
  };

  const isPathActive = (path: string) => {
    // Special case for home page
    if (path === '/for-you' || path === '/popular') {
      return ['/popular', '/for-you', '/latest', '/following'].includes(currentPath);
    }

    if (path === '/fund') {
      return currentPath.startsWith('/fund');
    }

    if (path === '/earn') {
      return currentPath.startsWith('/earn') || currentPath === '/grants';
    }

    if (path === '/notebook') {
      return currentPath.startsWith('/notebook');
    }

    if (path === '/endowment') {
      return currentPath.startsWith('/endowment');
    }

    // Special case for lists page - match /lists and /list/[id]
    if (path === '/lists') {
      return currentPath === '/lists' || currentPath.startsWith('/list/');
    }

    // Default case - exact match
    return path === currentPath;
  };

  const NavLink: React.FC<{
    item: NavigationItem;
    currentPath: string;
    onUnimplementedFeature: (featureName: string) => void;
    /** When true, render the "New" badge next to the label. */
    showNewBadge?: boolean;
    /** Fired alongside navigation to mark the new-badge feature as seen. */
    onDismissNew?: () => void;
  }> = ({ item, currentPath, onUnimplementedFeature, showNewBadge, onDismissNew }) => {
    const { executeAuthenticatedAction } = useAuthenticatedAction();
    const router = useRouter();
    const buttonStyles = getButtonStyles(item.href, currentPath);
    const isActive = isPathActive(item.href);

    // Set icon colors based on active state
    const iconColor = isActive ? '#3971ff' : '#404040'; // Primary-500 for active, gray-600 for inactive

    // Get the appropriate icon based on active state
    const getIconName = (): IconName | undefined => {
      if (!item.iconKey) return undefined;

      const iconSet = navIconMap[item.iconKey];
      return isActive && iconSet.solid ? iconSet.solid : iconSet.light;
    };

    const handleClick = (e: React.MouseEvent) => {
      if (item.isUnimplemented) {
        e.preventDefault();
        onUnimplementedFeature(item.label);
        return;
      }

      if (onDismissNew) {
        onDismissNew();
      }

      if (item.requiresAuth) {
        e.preventDefault();
        executeAuthenticatedAction(() => router.push(item.href));
        return;
      }
    };

    // Determine if the current item is the Home item using FontAwesome
    const isHomeIcon = item.isFontAwesome && item.iconKey === 'home';

    // Conditionally apply minimized classes
    const iconContainerClass = forceMinimize
      ? 'h-[26px] w-[26px] mr-0 flex items-center justify-center flex-shrink-0'
      : 'h-[26px] w-[26px] mr-4 tablet:max-sidebar-compact:!mr-0 flex items-center justify-center flex-shrink-0';

    const textContainerClass = forceMinimize
      ? 'flex items-center justify-between w-full min-w-0 !hidden'
      : 'w-full min-w-0 tablet:max-sidebar-compact:!hidden';

    return (
      <Link href={item.href} onClick={handleClick} className={buttonStyles} scroll={false}>
        <div className={iconContainerClass}>
          {item.href === '/lists' ? (
            <FontAwesomeIcon
              icon={isActive ? faBookmarkSolid : faBookmarkLight}
              fontSize={24}
              color={iconColor}
            />
          ) : isHomeIcon ? (
            <FontAwesomeIcon
              icon={isActive ? faHouseSolid : faHouseLight}
              fontSize={20}
              color={iconColor}
            />
          ) : item.isLucideSprout ? (
            <Sprout size={22} color={iconColor} strokeWidth={isActive ? 2.25 : 2} />
          ) : item.iconKey ? (
            <Icon name={getIconName() as IconName} size={26} color={iconColor} />
          ) : (
            <div className="w-[26px] h-[26px]" />
          )}
        </div>
        <div className={textContainerClass}>
          <span className="inline-flex items-center gap-2 truncate text-[16px] font-semibold">
            {item.label}
            {showNewBadge && (
              <Badge
                variant="success"
                size="xs"
                className="!rounded-md !bg-primary-500 !text-white !border-primary-600 uppercase tracking-wider font-bold"
              >
                New
              </Badge>
            )}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-1.5">
      {navigationItems.map((item) => {
        const isBeforeEndowmentCutoff = Date.now() < ENDOWMENT_NEW_BADGE_CUTOFF.getTime();
        const isEndowmentNewBadge =
          item.newFeatureName === ENDOWMENT_NAV_FEATURE &&
          item.isNew === true &&
          isBeforeEndowmentCutoff &&
          endowmentBadgeStatus === 'checked' &&
          !isEndowmentBadgeDismissed;

        return (
          <NavLink
            key={item.href}
            item={item}
            currentPath={currentPath}
            onUnimplementedFeature={onUnimplementedFeature}
            showNewBadge={isEndowmentNewBadge}
            onDismissNew={
              item.newFeatureName === ENDOWMENT_NAV_FEATURE ? dismissEndowmentBadge : undefined
            }
          />
        );
      })}
    </div>
  );
};
