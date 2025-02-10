'use client';

import { Home, BookOpen, Star, Notebook, HandCoins, Coins } from 'lucide-react';
import Link from 'next/link';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  currentPath: string;
  onUnimplementedFeature: (featureName: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath, onUnimplementedFeature }) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const router = useRouter();

  const navigationItems = [
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
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('RH Journal');
      },
    },
    {
      label: 'Peer Reviews',
      href: '/peerreviews',
      icon: Star,
      description: 'Review and rate research papers',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('Peer Reviews');
      },
    },
    {
      label: 'Lab Notebook',
      href: '/notebook',
      icon: Notebook,
      description: 'Access your research notebook',
      requiresAuth: true,
    },
  ];

  const getButtonStyles = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? 'flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-indigo-600 bg-indigo-50 rounded-lg group'
      : 'flex items-center w-full px-5 py-3.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg group';
  };

  const getIconStyles = (path: string) => {
    const isActive = currentPath === path;
    return `h-[22px] w-[22px] mr-3.5 ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`;
  };

  const handleNavClick = (e: React.MouseEvent, item: (typeof navigationItems)[0]) => {
    if (item.onClick) {
      item.onClick(e);
      return;
    }

    if (item.requiresAuth) {
      e.preventDefault();
      executeAuthenticatedAction(() => {
        router.push(item.href);
      });
    }
  };

  return (
    <>
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={getButtonStyles(item.href)}
            onClick={(e) => handleNavClick(e, item)}
          >
            <item.icon className={getIconStyles(item.href)} />
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
