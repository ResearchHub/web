'use client'

import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50">
    <LeftSidebar />
    
    <div className="flex-1 ml-64 mr-80">
      <TopBar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>

    <RightSidebar />
  </div>
);
