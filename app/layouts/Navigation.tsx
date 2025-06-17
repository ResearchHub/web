'use client';

import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/Editor/components/ui/Button';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';

// Define icon mapping for navigation items with both light and solid variants
interface NavIcon {
  light: IconName;
  solid: IconName;
}

type NavIconKey = 'earn' | 'fund' | 'journal' | 'notebook' | 'home' | 'leaderboard';

interface NavigationItem {
  label: string;
  href: string;
  iconKey?: NavIconKey;
  description: string;
  requiresAuth?: boolean;
  isUnimplemented?: boolean;
  isFontAwesome?: boolean;
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
  leaderboard: {
    light: 'gold1',
    solid: 'gold2',
  },
};

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onUnimplementedFeature,
  forceMinimize = false,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: '/trending',
      iconKey: 'home',
      isFontAwesome: true,
      description: 'Navigate to the home page',
    },
    {
      label: 'Earn',
      href: '/earn',
      iconKey: 'earn',
      description: 'Find opportunities to earn RSC',
    },
    {
      label: 'Fund',
      href: '/fund',
      iconKey: 'fund',
      description: 'Browse grants and fundraising opportunities',
    },
    {
      label: 'RH Journal',
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
      label: 'Leaderboard',
      href: '/leaderboard',
      description: 'View the ResearchHub Leaderboard',
    },
  ];

  const getButtonStyles = (path: string, currentPath: string) => {
    const isActive =
      path === '/' ? ['/', '/following', '/latest'].includes(currentPath) : path === currentPath;

    // Use either responsive or force minimized classes
    const responsiveClasses = forceMinimize
      ? '!px-2 !justify-center'
      : 'tablet:max-sidebar-compact:!px-2 tablet:max-sidebar-compact:!justify-center';

    return isActive
      ? `flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-indigo-600 ${responsiveClasses} bg-indigo-50 rounded-lg group`
      : `flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-gray-700 ${responsiveClasses} hover:bg-gray-50 rounded-lg group`;
  };

  const isPathActive = (path: string) => {
    // Special case for home page
    if (path === '/') {
      return ['/', '/following', '/latest'].includes(currentPath);
    }

    // Special case for notebook page - match any route that starts with /notebook
    if (path === '/notebook') {
      return currentPath.startsWith('/notebook');
    }

    // Special case for leaderboard page
    if (path === '/leaderboard') {
      return currentPath.startsWith('/leaderboard');
    }

    // Default case - exact match
    return path === currentPath;
  };

  const NavLink: React.FC<{
    item: NavigationItem;
    currentPath: string;
    onUnimplementedFeature: (featureName: string) => void;
  }> = ({ item, currentPath, onUnimplementedFeature }) => {
    const { executeAuthenticatedAction } = useAuthenticatedAction();
    const router = useRouter();
    const buttonStyles = getButtonStyles(item.href, currentPath);
    const isActive = isPathActive(item.href);

    // Set icon colors based on active state
    const iconColor = isActive ? '#4f46e5' : '#404040'; // Indigo-600 for active, gray-600 for inactive

    // Get the appropriate icon based on active state
    const getIconName = (): IconName | undefined => {
      if (!item.iconKey) return undefined;

      const iconSet = navIconMap[item.iconKey];
      return isActive && iconSet.solid ? iconSet.solid : iconSet.light;
    };

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();

      if (item.isUnimplemented) {
        onUnimplementedFeature(item.label);
        return;
      }

      if (item.requiresAuth) {
        executeAuthenticatedAction(() => router.push(item.href));
        return;
      }

      router.push(item.href);
    };

    // Determine if the current item is the Home item using FontAwesome
    const isHomeIcon = item.isFontAwesome && item.iconKey === 'home';

    // Conditionally apply minimized classes
    const iconContainerClass = forceMinimize
      ? 'h-[26px] w-[26px] mr-0 flex items-center justify-center'
      : 'h-[26px] w-[26px] mr-2.5 tablet:max-sidebar-compact:!mr-0 flex items-center justify-center';

    const textContainerClass = forceMinimize
      ? 'flex items-center justify-between w-full min-w-0 !hidden'
      : 'flex items-center justify-between w-full min-w-0 tablet:max-sidebar-compact:!hidden';

    return (
      <Button onClick={handleClick} className={buttonStyles} variant="ghost">
        <div className={iconContainerClass}>
          {item.href === '/leaderboard' ? (
            <ChartNoAxesColumnIncreasing
              size={22}
              color={iconColor}
              strokeWidth={isActive ? 2.5 : 2}
            />
          ) : isHomeIcon ? (
            <FontAwesomeIcon
              icon={isActive ? faHouseSolid : faHouseLight}
              fontSize={20}
              color={iconColor}
            />
          ) : item.iconKey ? (
            <Icon name={getIconName() as IconName} size={26} color={iconColor} />
          ) : (
            <div className="w-[26px] h-[26px]" />
          )}
        </div>
        <div className={textContainerClass}>
          <span className="truncate text-[16px]">{item.label}</span>
        </div>
      </Button>
    );
  };

  return (
    <div className="space-y-1.5">
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          currentPath={currentPath}
          onUnimplementedFeature={onUnimplementedFeature}
        />
      ))}
    </div>
  );
};
