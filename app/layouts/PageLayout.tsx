'use client'

import { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
import { RightSidebar } from './RightSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, rightSidebar }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile overlay - only for left sidebar */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Main content area with sidebars */}
      <div className="flex relative">
        {/* Left Sidebar */}
        <div className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white z-40 w-72 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <LeftSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1">
          {/* TopBar - Full width */}
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
            <TopBar 
              onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            />
          </div>

          {/* Content + Right Sidebar Container */}
          <div className="flex">
            <div className="w-full max-w-4xl pl-32 pr-12 py-6">
              {children}
            </div>

            {/* Right Sidebar - Hidden below 1200px */}
            <div className="w-80 border-l bg-white/50 backdrop-blur-sm p-6 overflow-y-auto">
              {rightSidebar || <RightSidebar />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
