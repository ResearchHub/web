'use client'

import { 
  Home, Coins, GraduationCap, Store, 
  BookOpen, Star, BadgeCheck, Plus, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { PublishMenu } from './PublishMenu';
import { useState, useCallback } from 'react';

interface NavigationProps {
  currentPath: string;
  isPublishMenuOpen: boolean;
  onPublishMenuChange: (isOpen: boolean) => void;
  onUnimplementedFeature: (featureName: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPath, 
  isPublishMenuOpen, 
  onPublishMenuChange, 
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
      label: 'Learn',
      href: '/learn',
      icon: GraduationCap,
      description: 'Learn about research and academia'
    },
    {
      label: 'Verify Identity',
      href: '/verifyidentity',
      icon: BadgeCheck,
      description: 'Verify your identity for secure transactions',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onUnimplementedFeature('Identity Verification');
      }
    },
  ];

  const handlePublishClick = useCallback(() => {
    console.log('Navigation requesting change to:', !isPublishMenuOpen);
    onPublishMenuChange(!isPublishMenuOpen);
  }, [onPublishMenuChange, isPublishMenuOpen]);

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
    <div className="space-y-1 relative">
      <div className="relative">
        <PublishMenu 
          isOpen={isPublishMenuOpen}
          onClose={() => onPublishMenuChange(false)}
        >
          <button 
            className={getButtonStyles('')}
            onClick={handlePublishClick}
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
