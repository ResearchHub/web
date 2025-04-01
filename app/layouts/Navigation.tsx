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

// Define icon mapping for navigation items with both light and solid variants
interface NavIcon {
  light: IconName;
  solid?: IconName;
}

type NavIconKey = 'earn' | 'fund' | 'journal' | 'notebook' | 'home' | 'discuss';

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
}

// Map navigation icons to their light and solid variants
const navIconMap: Record<NavIconKey, NavIcon> = {
  home: {
    light: 'home' as IconName,
    solid: 'home' as IconName,
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
    solid: 'solidNotebook',
  },
  discuss: {
    light: 'comment',
    solid: 'comment',
  },
};

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onUnimplementedFeature }) => {
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
      href: '/',
      iconKey: 'home',
      isFontAwesome: true,
      description: 'Navigate to the home page',
    },
    {
      label: 'Discuss',
      href: '/discuss',
      iconKey: 'discuss',
      description: 'Join research discussions',
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
      label: 'Lab Notebook',
      href: '/notebook',
      iconKey: 'notebook',
      description: 'Access your research notebook',
      requiresAuth: true,
    },
  ];

  const getButtonStyles = (path: string, currentPath: string) => {
    const isActive =
      path === '/' ? ['/', '/following', '/latest'].includes(currentPath) : path === currentPath;

    return isActive
      ? 'flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-indigo-600 bg-indigo-50 rounded-lg group'
      : 'flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg group';
  };

  const isPathActive = (path: string) => {
    return path === '/'
      ? ['/', '/following', '/latest'].includes(currentPath)
      : path === currentPath;
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

    return (
      <Button onClick={handleClick} className={buttonStyles} variant="ghost">
        <div className="h-[26px] w-[26px] mr-2.5 flex items-center justify-center">
          {item.isFontAwesome && item.iconKey === 'home' ? (
            <FontAwesomeIcon
              icon={isActive ? faHouseSolid : faHouseLight}
              fontSize={20}
              color={iconColor}
            />
          ) : (
            item.iconKey && <Icon name={getIconName() as IconName} size={26} color={iconColor} />
          )}
        </div>
        <div className="flex items-center justify-between w-full min-w-0">
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
