'use client'

import { 
  Home, Coins, GraduationCap, Store, BookOpen, 
  Star, BadgeCheck, Beaker 
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FooterLinks } from '../FooterLinks';
import { Navigation } from './Navigation';

export const LeftSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 fixed h-screen border-r bg-white overflow-y-auto flex flex-col">
      <div className="flex-1">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <Beaker className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              ResearchHub
            </h1>
          </div>
        </div>
        
        <div className="px-2 py-4">
          <Navigation currentPath={pathname} />
        </div>
      </div>

      <FooterLinks />
    </div>
  );
};
