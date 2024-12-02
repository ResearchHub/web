'use client'

import { useState } from 'react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile overlay - only for left sidebar */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white z-40 w-64 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <LeftSidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 w-full">
        <TopBar 
          onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />
        <div className="flex justify-center lg:ml-10 lg:mr-10">
          <div className="w-full max-w-4xl py-6">
            {children}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden on mobile, always visible on desktop */}
      <div className="hidden lg:block h-full bg-white w-80 border-l">
        <RightSidebar />
      </div>
    </div>
  );
};
