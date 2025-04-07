'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Search } from '@/components/Search/Search';
import { useUser } from '@/contexts/UserContext';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { user, isLoading } = useUser();

  return (
    <>
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 h-[64px]">
        <div className="h-full relative flex items-center">
          {/* Mobile menu button */}
          <div className="block lg:hidden pl-4">
            <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Centered Search */}
          <div className="flex-1 px-4 py-4 lg:px-8">
            <div className="mx-auto max-w-4xl">
              {/* Search Input 500px */}
              <div className="w-[600px] mx-auto">
                <Search
                  placeholder="Search any paper, journal, topic, ..."
                  className="[&_input]:rounded-full [&_input]:bg-[#F8F9FC] mt-2"
                />
              </div>
            </div>
          </div>

          {/* Right padding area */}
          <div className="w-16 lg:w-16">{/* Empty div for spacing */}</div>
        </div>
      </div>
    </>
  );
};
