'use client';

import { Home, BookOpen, Star, Notebook, HandCoins, Coins } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/Editor/components/ui/Button';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  requiresAuth?: boolean;
  isUnimplemented?: boolean;
}

interface NavigationProps {
  currentPath: string;
  onUnimplementedFeature: (featureName: string) => void;
}

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
      icon: Home,
      description: 'Navigate to the home page',
    },
    {
      label: 'Earn',
      href: '/earn',
      icon: Coins,
      description: 'Find opportunities to earn RSC',
    },
    {
      label: 'Fund',
      href: '/fund',
      icon: HandCoins,
      description: 'Browse grants and fundraising opportunities',
    },
    {
      label: 'RH Journal',
      href: '/rhjournal',
      icon: BookOpen,
      description: 'Read and publish research papers',
      isUnimplemented: true,
    },
    {
      label: 'Lab Notebook',
      href: '/notebook',
      icon: Notebook,
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

  const getIconStyles = (path: string, currentPath: string) => {
    const isActive =
      path === '/' ? ['/', '/following', '/latest'].includes(currentPath) : path === currentPath;

    return `h-[22px] w-[22px] mr-3.5 ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`;
  };

  const NavLink: React.FC<{
    item: NavigationItem;
    currentPath: string;
    onUnimplementedFeature: (featureName: string) => void;
  }> = ({ item, currentPath, onUnimplementedFeature }) => {
    const { executeAuthenticatedAction } = useAuthenticatedAction();
    const router = useRouter();
    const buttonStyles = getButtonStyles(item.href, currentPath);
    const iconStyles = getIconStyles(item.href, currentPath);

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
        <item.icon className={iconStyles} />
        <div className="flex items-center justify-between w-full min-w-0">
          <span className="truncate">{item.label}</span>
        </div>
      </Button>
    );
  };

  return (
    <div className="space-y-1">
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
