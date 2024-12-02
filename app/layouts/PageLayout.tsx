'use client'

import { useState, useCallback } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { TopBar } from './TopBar';
import { RightSidebar } from './RightSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, rightSidebar }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isPublishMenuOpen, setIsPublishMenuOpen] = useState(false);

  const handlePublishMenuChange = useCallback((isOpen: boolean) => {
    console.log('PageLayout changing publish menu to:', isOpen);
    setIsPublishMenuOpen(isOpen);
  }, []);

  return (
    <div className="flex min-h-screen bg-white relative">
      {/* Mobile overlay - only for left sidebar */}
      {isLeftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Publish menu overlay */}
      {isPublishMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsPublishMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white z-50 w-64 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <LeftSidebar 
          isPublishMenuOpen={isPublishMenuOpen}
          onPublishMenuChange={handlePublishMenuChange}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 justify-center w-full">
        <TopBar 
          onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        />
        <div className="flex justify-center">
          <div className="w-full max-w-4xl py-6 px-4 lg:ml-8 lg:mr-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Hidden below 1200px */}
      <div className="hidden wide:block right-0 top-0 h-full bg-white w-80 border-l">
        {rightSidebar || <RightSidebar />}
      </div>
    </div>
  );
};
