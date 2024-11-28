'use client'

import { Search, Bell, CircleUser} from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <>
      {/* Spacer div to push content down */}
      <div className="h-16" />
      
      {/* Actual TopBar */}
      <div className="fixed top-0 left-64 right-80 backdrop-blur-md bg-white/80 border-b z-50 h-16">
        <div className="h-full max-w-4xl mx-auto flex items-center justify-between">
          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search papers, reviews, grants..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-gray-200"
            />
          </div>        
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
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
    </>
  );
};
