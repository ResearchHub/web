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
      <Link 
        href="/" 
        className={getButtonStyles('/')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <Home className={getIconStyles('/')} />
        Home
      </Link>
      <Link 
        href="/researchcoin" 
        className={`${getButtonStyles('/researchcoin')} justify-between`}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <div className="flex items-center">
          <Coins className={getIconStyles('/researchcoin')} />
          My ResearchCoin
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          +10
        </span>
      </Link>
      <Link 
        href="/marketplace" 
        className={getButtonStyles('/marketplace')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <Store className={getIconStyles('/marketplace')} />
        Marketplace
      </Link>
      <Link 
        href="/rhjournal" 
        className={getButtonStyles('/rhjournal')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <BookOpen className={getIconStyles('/rhjournal')} />
        RH Journal
      </Link>
      <Link 
        href="/peerreviews" 
        className={getButtonStyles('/peerreviews')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <Star className={getIconStyles('/peerreviews')} />
        Peer Reviews
      </Link>
      <Link 
        href="/learn" 
        className={getButtonStyles('/learn')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <GraduationCap className={getIconStyles('/learn')} />
        Learn
      </Link>
      <Link 
        href="/verifyidentity" 
        className={getButtonStyles('/verifyidentity')}
        onMouseEnter={() => setIsPublishMenuOpen(false)}
      >
        <BadgeCheck className={getIconStyles('/verifyidentity')} />
        Verify Identity
      </Link>
    </div>
  );
};
