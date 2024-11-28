'use client'

import { Search, FileText, Notebook, Bell, CircleUser, ChevronDown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopBar: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <div className="sticky top-0 backdrop-blur-md bg-white/80 border-b border-gray-100 z-20 h-16">
      <div className="h-full flex items-center">
        <div className="px-6 h-full flex items-center">
          {pathname === '/notebook' && (
            <Link href="/">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                <ArrowLeft className="h-6 w-6" />
                <span className="text-lg font-semibold">Lab Notebook</span>
              </button>
            </Link>
          )}
        </div>
        
        <div className="flex-1 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search papers, reviews, grants..."
                className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/notebook">
                <button className="relative">
                  <Notebook className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                </button>
              </Link>
              <button className="relative">
                <Bell className="h-6 w-6 text-gray-600 hover:text-indigo-600" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <CircleUser className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
