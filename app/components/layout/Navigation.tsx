'use client'

import { 
  Home, Coins, GraduationCap, Store, 
  BookOpen, Star, BadgeCheck, Plus, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { PublishMenu } from './PublishMenu';
import { useState } from 'react';

interface NavigationProps {
  currentPath: string;
}

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
    description: 'Manage your ResearchCoin balance and transactions'
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
    description: 'Read and publish research papers'
  },
  {
    label: 'Peer Reviews',
    href: '/peerreviews',
    icon: Star,
    description: 'Review and rate research papers'
  },
  {
    label: 'Learn',
    href: '/learn',
    icon: GraduationCap,
    description: 'Learn about research and academia'
  },
  {
    label: 'Verify Identity',
    href: '/verifyidentity',
    icon: BadgeCheck,
    description: 'Verify your identity for secure transactions'
  },
];

export const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);

  const getButtonStyles = (path: string) => {
    const isActive = currentPath === path;
    const isNewButton = path === '';
    const isNewButtonActive = isNewButton && isPublishMenuOpen;

    if (isActive) {
      return "flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group";
    }
    
    if (isNewButtonActive) {
      return "flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg group";
    }

    return "flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group";
  };

  const getIconStyles = (path: string) => {
    const isActive = currentPath === path;
    const isNewButton = path === '';
    const isNewButtonActive = isNewButton && isPublishMenuOpen;

    return `h-5 w-5 mr-3 ${isActive || isNewButtonActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}`;
  };

  return (
    <div 
      className="space-y-1"
      onMouseLeave={() => setIsPublishMenuOpen(false)}
    >
      <div 
        onMouseEnter={() => setIsPublishMenuOpen(true)}
        className="relative"
      >
        <PublishMenu 
          isOpen={isPublishMenuOpen}
          onMouseEnter={() => setIsPublishMenuOpen(true)}
          onMouseLeave={() => setIsPublishMenuOpen(false)}
        >
          <div className="absolute -right-4 w-4 h-full" />
          <button 
            className={getButtonStyles('')}
            onMouseEnter={() => setIsPublishMenuOpen(true)}
          >
            <Plus className={getIconStyles('')} />
            New
            <ChevronRight className="h-4 w-4 ml-auto" />
          </button>
        </PublishMenu>
      </div>
      {navigationItems.map(item => (
        <Link 
          key={item.href}
          href={item.href} 
          className={getButtonStyles(item.href)}
          onMouseEnter={() => setIsPublishMenuOpen(false)}
        >
          <item.icon className={getIconStyles(item.href)} />
          {item.label}
        </Link>
      ))}
    </div>
  );
};
