'use client'

import { 
  Home, Coins, GraduationCap, Store, 
  BookOpen, Star, BadgeCheck 
} from 'lucide-react';

export const Navigation: React.FC = () => (
  <div className="space-y-1">
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group">
      <Home className="h-5 w-5 mr-3 text-indigo-600" />
      Home
    </button>
    <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <div className="flex items-center">
        <Coins className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
        My ResearchCoin
      </div>
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        +10
      </span>
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <GraduationCap className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Learn
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <Store className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Marketplace
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <BookOpen className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      RH Journal
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <Star className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Peer Reviews
    </button>
    <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg group">
      <BadgeCheck className="h-5 w-5 mr-3 text-gray-600 group-hover:text-indigo-600" />
      Verify Identity
    </button>
  </div>
);
