'use client'

import { 
  Home, Coins, GraduationCap, Store, 
  BookOpen, Star, BadgeCheck 
} from 'lucide-react';
import Link from 'next/link';

interface NavigationProps {
  currentPath: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
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
      <Link href="/" className={getButtonStyles('/')}>
        <Home className={getIconStyles('/')} />
        Home
      </Link>
      <Link href="/researchcoin" className={`${getButtonStyles('/researchcoin')} justify-between`}>
        <div className="flex items-center">
          <Coins className={getIconStyles('/researchcoin')} />
          My ResearchCoin
        </div>
        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          +10
        </span>
      </Link>
      <Link href="/marketplace" className={getButtonStyles('/marketplace')}>
        <Store className={getIconStyles('/marketplace')} />
        Marketplace
      </Link>
      <Link href="/rhjournal" className={getButtonStyles('/rhjournal')}>
        <BookOpen className={getIconStyles('/rhjournal')} />
        RH Journal
      </Link>
      <Link href="/peerreviews" className={getButtonStyles('/peerreviews')}>
        <Star className={getIconStyles('/peerreviews')} />
        Peer Reviews
      </Link>
      <Link href="/learn" className={getButtonStyles('/learn')}>
        <GraduationCap className={getIconStyles('/learn')} />
        Learn
      </Link>
      <Link href="/verifyidentity" className={getButtonStyles('/verifyidentity')}>
        <BadgeCheck className={getIconStyles('/verifyidentity')} />
        Verify Identity
      </Link>
    </div>
  );
};
