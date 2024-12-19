'use client'

import { 
  Home, Coins, GraduationCap, Store, 
  BookOpen, Star, Info, Notebook
} from 'lucide-react';
import Link from 'next/link';

interface NavigationProps {
  currentPath: string;
  onUnimplementedFeature: (featureName: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPath, 
  onUnimplementedFeature 
}) => {
  const navigationItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      description: 'Navigate to the home page'
    },
    {
      label: 'My ResearchCoin',
      href: '/researchcoin',
      icon: Coins,
      description: 'Manage your ResearchCoin balance and transactions',
      badge: {
        text: '+10 RSC',
        color: 'green'
      }
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      icon: Store,
      description: 'Browse and buy research papers'
    },
    {
      label: 'RH Journal',
      href: '/rhjournal',
      icon: BookOpen,
      description: 'Read and publish research papers',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('RH Journal');
      }
    },
    {
      label: 'Peer Reviews',
      href: '/peerreviews',
      icon: Star,
      description: 'Review and rate research papers',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('Peer Reviews');
      }
    },
    {
      label: 'Lab Notebook',
      href: '/notebook',
      icon: Notebook,
      description: 'Access your research notebook'
    },
    {
      label: 'About',
      href: '/about',
      icon: Info,
      description: 'Learn about ResearchHub'
    }
  ];

  const getButtonStyles = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? "flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group"
      : "flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group";
  };

  const getIconStyles = (path: string) => {
    const isActive = currentPath === path;
    return `h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`;
  };

  return (
    <div className="space-y-1">
      {navigationItems.map(item => (
        <Link 
          key={item.href}
          href={item.href} 
          className={getButtonStyles(item.href)}
          onClick={item.onClick}
        >
          <item.icon className={getIconStyles(item.href)} />
          <div className="flex items-center justify-between w-full min-w-0">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="flex-shrink-0 bg-green-50 text-green-700 text-[10px] font-medium px-1 py-0.5 rounded-full ml-2 whitespace-nowrap">
                +10 RSC
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
