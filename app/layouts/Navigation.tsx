'use client';

import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/ui/icons/Icon';
import { IconName } from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse as faHouseSolid } from '@fortawesome/pro-solid-svg-icons';
import { faHouse as faHouseLight } from '@fortawesome/pro-light-svg-icons';
import { Sprout, Star } from 'lucide-react';
import { isClassicHomeFeedPath, useHomeHref } from '@/hooks/useHomeHref';
import { cn } from '@/utils/styles';

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
  isLucideStar?: boolean;
  isLucideSprout?: boolean;
  isHome?: boolean;
}

interface NavigationProps {
  currentPath: string;
  onUnimplementedFeature: (featureName: string) => void;
  forceMinimize?: boolean;
}

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
  const homeHref = useHomeHref();
  const isFeedV2Nav =
    currentPath.startsWith('/feed-v2') ||
    currentPath === '/my-funding' ||
    currentPath.startsWith('/fund/dashboard');

  const navigationItems: NavigationItem[] = [
    {
      label: 'Home',
      href: homeHref,
      iconKey: 'home',
      isFontAwesome: true,
      isHome: true,
      description: 'Navigate to the home page',
    },
    ...(isFeedV2Nav
      ? [
          {
            label: 'My Funding',
            href: '/my-funding',
            iconKey: 'fund' as const,
            requiresAuth: true,
            description: 'View your funding activity',
          },
        ]
      : [
          {
            label: 'Fund',
            href: '/fund',
            iconKey: 'fund' as const,
            description: 'Browse grants and fundraising opportunities',
          },
        ]),
    {
      label: 'Peer Review',
      href: '/earn',
      isLucideStar: true,
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
      requiresAuth: true,
      description: 'Access your research notebook',
    },
    {
      label: 'Endowment',
      href: '/endowment',
      isLucideSprout: true,
      description: 'Learn about the ResearchHub Endowment',
    },
  ];

  const getButtonStyles = (path: string, isHome?: boolean) => {
    const isActive = isPathActive(path, isHome);

    return cn(
      'flex w-full items-center rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
      forceMinimize
        ? '!justify-center !px-2'
        : 'tablet:max-sidebar-compact:!justify-center tablet:max-sidebar-compact:!px-2',
      isActive
        ? 'bg-primary-50 font-semibold text-primary-600'
        : 'font-medium text-gray-700 hover:bg-gray-50'
    );
  };

  const isPathActive = (path: string, isHome?: boolean) => {
    if (isHome) {
      return (
        isClassicHomeFeedPath(currentPath) ||
        currentPath === '/' ||
        currentPath.startsWith('/feed-v2')
      );
    }

    if (path === '/fund') {
      return (
        currentPath === '/fund' ||
        currentPath.startsWith('/fund/proposals') ||
        (currentPath.startsWith('/fund/') && !currentPath.startsWith('/fund/dashboard'))
      );
    }

    if (path === '/earn') {
      return currentPath.startsWith('/earn') || currentPath === '/grants';
    }

    if (path === '/my-funding') {
      return (
        currentPath === '/my-funding' ||
        currentPath === '/fund/dashboard' ||
        currentPath.startsWith('/fund/dashboard/')
      );
    }

    if (path === '/notebook') {
      return currentPath.startsWith('/notebook');
    }

    if (path === '/endowment') {
      return currentPath.startsWith('/endowment');
    }

    return path === currentPath;
  };

  const NavLink: React.FC<{
    item: NavigationItem;
    onUnimplementedFeature: (featureName: string) => void;
  }> = ({ item, onUnimplementedFeature }) => {
    const { executeAuthenticatedAction } = useAuthenticatedAction();
    const router = useRouter();
    const buttonStyles = getButtonStyles(item.href, item.isHome);
    const isActive = isPathActive(item.href, item.isHome);

    const iconColor = isActive ? '#3971ff' : '#404040';

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

      if (item.requiresAuth) {
        e.preventDefault();
        executeAuthenticatedAction(() => router.push(item.href));
        return;
      }
    };

    const isHomeIcon = item.isFontAwesome && item.iconKey === 'home';

    const iconContainerClass = cn(
      'flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center',
      forceMinimize ? 'mr-0' : 'mr-3.5 tablet:max-sidebar-compact:!mr-0'
    );

    const textContainerClass = forceMinimize
      ? 'hidden'
      : 'flex w-full min-w-0 items-center tablet:max-sidebar-compact:!hidden';

    return (
      <Link
        href={item.href}
        onClick={handleClick}
        className={buttonStyles}
        aria-current={isActive ? 'page' : undefined}
        scroll={false}
      >
        <div className={iconContainerClass}>
          {isHomeIcon ? (
            <FontAwesomeIcon
              icon={isActive ? faHouseSolid : faHouseLight}
              fontSize={22}
              color={iconColor}
            />
          ) : item.isLucideStar ? (
            <Star
              size={22}
              color={iconColor}
              strokeWidth={isActive ? 2 : 2}
              fill={isActive ? iconColor : 'none'}
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
          <span className="inline-flex min-w-0 items-center gap-2 truncate">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        'flex-1 overflow-y-auto px-3 pt-6',
        forceMinimize ? '!px-2' : 'tablet:max-sidebar-compact:!px-2'
      )}
    >
      <div className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink key={item.label} item={item} onUnimplementedFeature={onUnimplementedFeature} />
        ))}
      </div>
    </nav>
  );
};
